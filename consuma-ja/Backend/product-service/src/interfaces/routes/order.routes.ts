import express, { Request, Response, RequestHandler } from 'express'
import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool } from '../../infrastructure/database/mysql.connection'

const router = express.Router()

type Queryable = Pool | PoolConnection

const SALE_STAGE_FLOW = ['SEPARANDO_PRODUTOS', 'LOGISTICA_TRANSPORTADORA', 'PRODUTOS_A_CAMINHO', 'PRODUTOS_ENTREGUES'] as const
export type SaleStage = (typeof SALE_STAGE_FLOW)[number]

const COMPLAINT_STATUS_FLOW = ['PENDENTE', 'ANALISE', 'APROVADA', 'REJEITADA'] as const
type ComplaintStatus = (typeof COMPLAINT_STATUS_FLOW)[number]

const DEFAULT_LIMIT = 25
const MAX_LIMIT = 100

class HttpError extends Error {
	status: number
	details?: any

	constructor(status: number, message: string, details?: any) {
		super(message)
		this.status = status
		this.details = details
	}
}

interface SaleRow extends RowDataPacket {
	venda_id: number
	venda_data: Date
	venda_total: number
	venda_status: string
	venda_etapa: SaleStage
	PESSOA_pessoa_id: number
	fornecedor_pessoa_id: number | null
	PROMOCAO_promocao_id: number | null
	ENDERECO_endereco_id: number | null
	retirada_no_fornecedor: number
	metodo_pagamento: string | null
	parcelas: number
	detalhes_pagamento: string | null
	cliente_nome: string
	cliente_email: string
	cliente_telefone: string | null
	cliente_cpf: string | null
	fornecedor_nome: string | null
	endereco_rua: string | null
	endereco_numero: string | null
	endereco_bairro: string | null
	endereco_cep: string | null
	endereco_complemento: string | null
	endereco_cidade: string | null
	endereco_estado: string | null
}

interface SaleItemRow extends RowDataPacket {
	venda_id: number
	quantidade: number
	preco_unitario: number
	produto_id: number
	produto_nome: string
	lote_id: number
	lote_codigo: string
}

interface SaleHistoryRow extends RowDataPacket {
	venda_id: number
	etapa: SaleStage
	descricao: string | null
	data_registro: Date
	registrado_por: number | null
	registrado_por_nome: string | null
}

interface FeedbackRow extends RowDataPacket {
	avaliacao_id: number
	venda_id: number
	avaliacao_data: Date
	pergunta_id: number | null
	nota: number | null
}

interface ComplaintRow extends RowDataPacket {
	devolucao_id: number
	venda_id: number
	devolucao_motivo: string
	devolucao_status: string
	devolucao_data: Date
	lote_id: number | null
	item_qtde: number | null
}

type FeedbackSummary = {
	avaliacaoId: number
	vendaId: number
	criadoEm: Date
	mediaNota: number | null
	notas: { perguntaId: number | null; nota: number | null }[]
}

type ComplaintSummary = {
	id: number
	vendaId: number
	motivo: string
	status: string
	criadoEm: Date
	itens: { loteId: number; quantidade: number }[]
}

type ComplaintItemInput = {
	loteId: number
	quantidade: number
}

interface ComplaintItemDetailRow extends RowDataPacket {
	devolucao_id: number
	lote_id: number
	quantidade: number
	produto_id: number | null
	produto_nome: string | null
}

interface ComplaintReportRow extends RowDataPacket {
	devolucao_id: number
	devolucao_data: Date
	devolucao_motivo: string
	devolucao_status: ComplaintStatus
	venda_id: number
	venda_total: number
	venda_status: string
	promocao_id: number | null
	promocao_descricao: string | null
	cliente_id: number
	cliente_nome: string
	cliente_email: string
	fornecedor_id: number | null
	fornecedor_nome: string | null
}

const registerComplaintEvaluation = async (
	executor: Queryable,
	complaint: {
		devolucao_id: number
		venda_id: number
		cliente_id: number
		promocao_id: number | null
		motivo: string | null
	},
	status: ComplaintStatus,
	actor: { id: number | null; tipo: string | null },
) => {
	const actionLabel = status === 'APROVADA' ? 'aprovada' : 'rejeitada'
	const descricaoBase = `Reclamação #${complaint.devolucao_id} ${actionLabel}`
	const [existing] = await executor.query<RowDataPacket[]>(
		`SELECT avaliacao_id FROM AVALIACAO WHERE VENDA_venda_id = ? AND avaliacao_descricao LIKE ? LIMIT 1`,
		[complaint.venda_id, `${descricaoBase}%`],
	)
	if (existing.length) {
		return
	}

	const actorLabel = actor.tipo === 'Admin' ? 'um administrador' : 'o fornecedor'
	const descricaoDetalhada = `${descricaoBase} por ${actorLabel}${
		actor.id ? ` (#${actor.id})` : ''
	} em ${new Date().toLocaleString('pt-BR')}. Motivo: ${complaint.motivo || 'não informado'}.`

	await executor.query<ResultSetHeader>(
		`INSERT INTO AVALIACAO (avaliacao_descricao, PROMOCAO_promocao_id, VENDA_venda_id, PESSOA_pessoa_id)
		 VALUES (?, ?, ?, ?)`,
		[descricaoDetalhada, complaint.promocao_id ?? null, complaint.venda_id, complaint.cliente_id],
	)
}

interface NotificationInput {
	pessoaId: number
	titulo: string
	mensagem: string
	tipo:
		| 'VENDA_NOVA'
		| 'VENDA_NOVA_FORNECEDOR'
		| 'VENDA_ETAPA_ATUALIZADA'
		| 'VENDA_CONCLUIDA'
		| 'VENDA_RECLAMACAO'
		| 'VENDA_RECLAMACAO_ATUALIZADA'
	destinatarioTipo: 'CLIENTE' | 'FORNECEDOR' | 'ADMIN'
	vendaId?: number | null
	rotaDestino?: string | null
	payload?: Record<string, any> | null
}

const SALE_BASE_SELECT = `
SELECT
	v.venda_id,
	v.venda_data,
	v.venda_total,
	v.venda_status,
	v.venda_etapa,
	v.PESSOA_pessoa_id,
	COALESCE(v.fornecedor_pessoa_id, pr.JURIDICA_PESSOA_pessoa_id) AS fornecedor_pessoa_id,
	v.PROMOCAO_promocao_id,
	v.ENDERECO_endereco_id,
	v.retirada_no_fornecedor,
	v.metodo_pagamento,
	v.parcelas,
	v.detalhes_pagamento,
	cli.pessoa_nome AS cliente_nome,
	cli.pessoa_email AS cliente_email,
	cli.pessoa_telefone AS cliente_telefone,
	fis.pessoa_cpf AS cliente_cpf,
	forn.pessoa_nome AS fornecedor_nome,
	e.rua AS endereco_rua,
	e.numero AS endereco_numero,
	e.bairro AS endereco_bairro,
	e.cep AS endereco_cep,
	e.complemento AS endereco_complemento,
	cid.cidade_nome AS endereco_cidade,
	est.estado_sigla AS endereco_estado
FROM VENDA v
JOIN PESSOA cli ON cli.pessoa_id = v.PESSOA_pessoa_id
LEFT JOIN FISICA fis ON fis.PESSOA_pessoa_id = cli.pessoa_id
LEFT JOIN PROMOCAO pr ON pr.promocao_id = v.PROMOCAO_promocao_id
LEFT JOIN PESSOA forn ON forn.pessoa_id = COALESCE(v.fornecedor_pessoa_id, pr.JURIDICA_PESSOA_pessoa_id)
LEFT JOIN ENDERECO e ON e.endereco_id = v.ENDERECO_endereco_id
LEFT JOIN CIDADE cid ON cid.cidade_id = e.CIDADE_cidade_id
LEFT JOIN ESTADO est ON est.estado_id = cid.ESTADO_estado_id
`

const COMPLAINT_REPORT_BASE_FROM = `
FROM DEVOLUCAO d
JOIN VENDA v ON v.venda_id = d.VENDA_venda_id
JOIN PESSOA cli ON cli.pessoa_id = v.PESSOA_pessoa_id
LEFT JOIN PROMOCAO pr ON pr.promocao_id = v.PROMOCAO_promocao_id
LEFT JOIN PESSOA forn ON forn.pessoa_id = COALESCE(v.fornecedor_pessoa_id, pr.JURIDICA_PESSOA_pessoa_id)
`

const respondError = (res: Response, error: unknown) => {
	if (error instanceof HttpError) {
		return res.status(error.status).json({ message: error.message, details: error.details })
	}

	console.error('[order-routes] Unexpected error', error)
	return res.status(500).json({ message: 'Erro interno no serviço de pedidos.' })
}

const parseIntParam = (value?: string | string[]) => {
	const raw = Array.isArray(value) ? value[0] : value
	const parsed = Number(raw)
	if (!raw || Number.isNaN(parsed)) {
		throw new HttpError(400, 'Parâmetro numérico inválido.')
	}
	return parsed
}

const safeJsonParse = <T>(value: unknown): T | null => {
	if (value === null || value === undefined) {
		return null
	}
	if (typeof value === 'object') {
		return value as T
	}
	if (typeof value === 'string') {
		try {
			return JSON.parse(value) as T
		} catch (error) {
			console.warn('[order-routes] Falha ao converter JSON', error)
			return null
		}
	}
	console.warn('[order-routes] Tipo não suportado para conversão JSON', typeof value)
	return null
}

const fetchItemsMap = async (vendaIds: number[], executor: Queryable = pool) => {
	const map = new Map<number, SaleItemRow[]>()
	if (!vendaIds.length) {
		return map
	}

	const [rows] = await executor.query<SaleItemRow[]>(
		`SELECT
			iv.VENDA_venda_id AS venda_id,
			iv.itemVenda_qtde AS quantidade,
			iv.itemVenda_preco AS preco_unitario,
			p.produto_id,
			p.produto_nome,
			lp.lote_id,
			lp.lote_codigo
		FROM ITEM_VENDA iv
		JOIN LOTEPROD lp ON lp.lote_id = iv.LOTEPROD_lote_id
		JOIN PRODUTO p ON p.produto_id = lp.produto_id
		WHERE iv.VENDA_venda_id IN (?)
		ORDER BY iv.VENDA_venda_id`,
		[vendaIds],
	)

	rows.forEach((row) => {
		const current = map.get(row.venda_id) || []
		current.push(row)
		map.set(row.venda_id, current)
	})

	return map
}

const fetchHistoryMap = async (vendaIds: number[], executor: Queryable = pool) => {
	const map = new Map<number, SaleHistoryRow[]>()
	if (!vendaIds.length) {
		return map
	}

	const [rows] = await executor.query<SaleHistoryRow[]>(
		`SELECT
			h.VENDA_venda_id AS venda_id,
			h.etapa,
			h.descricao,
			h.data_registro,
			h.registrado_por,
			rp.pessoa_nome AS registrado_por_nome
		FROM VENDA_ETAPA_HISTORICO h
		LEFT JOIN PESSOA rp ON rp.pessoa_id = h.registrado_por
		WHERE h.VENDA_venda_id IN (?)
		ORDER BY h.data_registro`,
		[vendaIds],
	)

	rows.forEach((row) => {
		const current = map.get(row.venda_id) || []
		current.push(row)
		map.set(row.venda_id, current)
	})

	return map
}

const fetchFeedbackMap = async (vendaIds: number[], executor: Queryable = pool) => {
	const map = new Map<number, FeedbackSummary>()
	if (!vendaIds.length) {
		return map
	}

	const [rows] = await executor.query<FeedbackRow[]>(
		`SELECT
			a.avaliacao_id,
			a.VENDA_venda_id AS venda_id,
			a.avaliacao_data,
			na.PERGUNTAS_perguntas_id AS pergunta_id,
			na.avaliacao_nota AS nota
		FROM AVALIACAO a
		LEFT JOIN NOTA_AVALIACAO na ON na.AVALIACAO_avaliacao_id = a.avaliacao_id
		WHERE a.VENDA_venda_id IN (?)
		ORDER BY a.avaliacao_data DESC`,
		[vendaIds],
	)

	rows.forEach((row) => {
		let summary = map.get(row.venda_id)
		if (!summary) {
			summary = {
				avaliacaoId: row.avaliacao_id,
				vendaId: row.venda_id,
				criadoEm: row.avaliacao_data,
				mediaNota: null,
				notas: [],
			}
			map.set(row.venda_id, summary)
		} else if (summary.avaliacaoId !== row.avaliacao_id) {
			// Já possuímos a avaliação mais recente para esta venda, ignorar demais registros
			return
		}
		if (summary && row.pergunta_id) {
			summary.notas.push({ perguntaId: row.pergunta_id, nota: row.nota })
		}
	})

	map.forEach((summary) => {
		const notasValidas = summary.notas.filter((nota) => typeof nota.nota === 'number')
		if (notasValidas.length) {
			const soma = notasValidas.reduce((acc, nota) => acc + Number(nota.nota ?? 0), 0)
			summary.mediaNota = Number((soma / notasValidas.length).toFixed(2))
		}
	})

	return map
}

const fetchComplaintMap = async (vendaIds: number[], executor: Queryable = pool) => {
	const map = new Map<number, ComplaintSummary>()
	if (!vendaIds.length) {
		return map
	}

	const [rows] = await executor.query<ComplaintRow[]>(
		`SELECT
			d.devolucao_id,
			d.VENDA_venda_id AS venda_id,
			d.devolucao_motivo,
			d.devolucao_status,
			d.devolucao_data,
			idv.LOTEPROD_lote_id AS lote_id,
			idv.itemDevolucao_qtde AS item_qtde
		FROM DEVOLUCAO d
		LEFT JOIN ITEM_DEVOLUCAO idv ON idv.DEVOLUCAO_devolucao_id = d.devolucao_id
		WHERE d.VENDA_venda_id IN (?)
		ORDER BY d.devolucao_data DESC`,
		[vendaIds],
	)

	rows.forEach((row) => {
		let summary = map.get(row.venda_id)
		if (!summary) {
			summary = {
				id: row.devolucao_id,
				vendaId: row.venda_id,
				motivo: row.devolucao_motivo,
				status: row.devolucao_status,
				criadoEm: row.devolucao_data,
				itens: [],
			}
			map.set(row.venda_id, summary)
		} else if (summary.id !== row.devolucao_id) {
			// Já temos a devolução mais recente, ignorar anteriores
			return
		}
		if (summary && row.lote_id && row.item_qtde) {
			summary.itens.push({ loteId: row.lote_id, quantidade: Number(row.item_qtde) })
		}
	})

	return map
}

const fetchComplaintItemsById = async (complaintIds: number[], executor: Queryable = pool) => {
	const map = new Map<
		number,
		Array<{ loteId: number; quantidade: number; produtoId: number | null; produtoNome: string | null }>
	>()
	if (!complaintIds.length) {
		return map
	}

	const [rows] = await executor.query<ComplaintItemDetailRow[]>(
		`SELECT
			idv.DEVOLUCAO_devolucao_id AS devolucao_id,
			idv.LOTEPROD_lote_id AS lote_id,
			idv.itemDevolucao_qtde AS quantidade,
			lp.produto_id,
			p.produto_nome
		FROM ITEM_DEVOLUCAO idv
		JOIN LOTEPROD lp ON lp.lote_id = idv.LOTEPROD_lote_id
		LEFT JOIN PRODUTO p ON p.produto_id = lp.produto_id
		WHERE idv.DEVOLUCAO_devolucao_id IN (?)
		ORDER BY idv.DEVOLUCAO_devolucao_id, idv.LOTEPROD_lote_id`,
		[complaintIds],
	)

	rows.forEach((row) => {
		const list = map.get(row.devolucao_id) || []
		list.push({
			loteId: row.lote_id,
			quantidade: Number(row.quantidade || 0),
			produtoId: row.produto_id !== null ? Number(row.produto_id) : null,
			produtoNome: row.produto_nome ?? null,
		})
		map.set(row.devolucao_id, list)
	})

	return map
}

const ensureHistoryRecords = async (
	rows: SaleRow[],
	historyMap: Map<number, SaleHistoryRow[]>,
	executor: Queryable = pool,
) => {
	const missingRows = rows.filter((row) => !historyMap.has(row.venda_id))
	if (!missingRows.length) {
		return
	}

	const insertValues = missingRows.map((row) => [
		row.venda_id,
		row.venda_etapa,
		'Pedido registrado e aguardando processamento.',
		row.fornecedor_pessoa_id ?? null,
	])

	await executor.query<ResultSetHeader>(
		`INSERT INTO VENDA_ETAPA_HISTORICO (VENDA_venda_id, etapa, descricao, registrado_por) VALUES ?`,
		[insertValues],
	)

	missingRows.forEach((row) => {
		const fallbackHistory = {
			venda_id: row.venda_id,
			etapa: row.venda_etapa,
			descricao: 'Pedido registrado e aguardando processamento.',
			data_registro: row.venda_data,
			registrado_por: row.fornecedor_pessoa_id ?? null,
			registrado_por_nome: row.fornecedor_nome ?? null,
		} as SaleHistoryRow
		historyMap.set(row.venda_id, [fallbackHistory])
	})
}

const mapVendaRow = (
	row: SaleRow,
	items: SaleItemRow[],
	history: SaleHistoryRow[],
	feedback?: FeedbackSummary,
	complaint?: ComplaintSummary,
) => {
	const normalizedHistory = history.length
		? history
		: [
			{
				venda_id: row.venda_id,
				etapa: row.venda_etapa,
				descricao: 'Pedido registrado e aguardando processamento.',
				data_registro: row.venda_data,
				registrado_por: row.fornecedor_pessoa_id ?? null,
				registrado_por_nome: row.fornecedor_nome ?? null,
			} as SaleHistoryRow,
		]
	const detalhesPagamento = safeJsonParse<Record<string, any>>(row.detalhes_pagamento)
	const quantidadeItens = items.reduce((sum, item) => sum + Number(item.quantidade || 0), 0)

	return {
		vendaId: row.venda_id,
		promocaoId: row.PROMOCAO_promocao_id,
		status: row.venda_status,
		etapa: row.venda_etapa,
		progresso: {
			etapaAtual: row.venda_etapa,
			indice: SALE_STAGE_FLOW.indexOf(row.venda_etapa),
			totalEtapas: SALE_STAGE_FLOW.length,
		},
		total: Number(row.venda_total),
		quantidadeItens,
		data: row.venda_data,
		pagamento: {
			metodo: row.metodo_pagamento,
			parcelas: row.parcelas,
			detalhes: detalhesPagamento,
		},
		retiradaNoFornecedor: Boolean(row.retirada_no_fornecedor),
		endereco: row.ENDERECO_endereco_id
			? {
				id: row.ENDERECO_endereco_id,
				rua: row.endereco_rua,
				numero: row.endereco_numero,
				bairro: row.endereco_bairro,
				cep: row.endereco_cep,
				complemento: row.endereco_complemento,
				cidade: row.endereco_cidade,
				estado: row.endereco_estado,
			}
			: null,
		cliente: {
			id: row.PESSOA_pessoa_id,
			nome: row.cliente_nome,
			email: row.cliente_email,
			telefone: row.cliente_telefone,
			cpf: row.cliente_cpf,
		},
		fornecedor: row.fornecedor_pessoa_id
			? {
				id: row.fornecedor_pessoa_id,
				nome: row.fornecedor_nome || 'Fornecedor não informado',
			}
			: null,
		itens: items.map((item) => ({
			produtoId: item.produto_id,
			produtoNome: item.produto_nome,
			loteId: item.lote_id,
			loteCodigo: item.lote_codigo,
			quantidade: item.quantidade,
			valorUnitario: Number(item.preco_unitario),
			valorTotal: Number(item.preco_unitario) * Number(item.quantidade),
		})),
		historico: normalizedHistory.map((entry) => ({
			etapa: entry.etapa,
			descricao: entry.descricao,
			dataRegistro: entry.data_registro,
			registradoPor: entry.registrado_por,
			registradoPorNome: entry.registrado_por_nome,
		})),
		feedback: feedback
			? {
				avaliacaoId: feedback.avaliacaoId,
				mediaNota: feedback.mediaNota,
				criadoEm: feedback.criadoEm,
				totalNotas: feedback.notas.length,
			}
			: null,
		reclamacao: complaint
			? {
				id: complaint.id,
				status: complaint.status,
				motivo: complaint.motivo,
				criadoEm: complaint.criadoEm,
				itens: complaint.itens,
			}
			: null,
	}
}

const buildVendaDetail = async (vendaId: number, executor: Queryable = pool, lock = false) => {
	const [rows] = await executor.query<SaleRow[]>(
		`${SALE_BASE_SELECT} WHERE v.venda_id = ? ${lock ? 'FOR UPDATE' : ''}`,
		[vendaId],
	)
	if (!rows.length) {
		return null
	}

	const itemsMap = await fetchItemsMap([vendaId], executor)
	const historyMap = await fetchHistoryMap([vendaId], executor)
	await ensureHistoryRecords(rows, historyMap, executor)
	const feedbackMap = await fetchFeedbackMap([vendaId], executor)
	const complaintMap = await fetchComplaintMap([vendaId], executor)

	return mapVendaRow(
		rows[0],
		itemsMap.get(vendaId) || [],
		historyMap.get(vendaId) || [],
		feedbackMap.get(vendaId) || undefined,
		complaintMap.get(vendaId) || undefined,
	)
}

const listVendas = async (
	field: 'cliente' | 'fornecedor',
	pessoaId: number,
	options?: { limit?: number; page?: number },
) => {
	const limit = Math.min(Math.max(options?.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT)
	const page = Math.max(options?.page ?? 1, 1)
	const offset = (page - 1) * limit
	const whereClause = field === 'cliente' ? 'v.PESSOA_pessoa_id = ?' : 'v.fornecedor_pessoa_id = ?'

	const [rows] = await pool.query<SaleRow[]>(
		`${SALE_BASE_SELECT} WHERE ${whereClause} ORDER BY v.venda_data DESC LIMIT ? OFFSET ?`,
		[pessoaId, limit, offset],
	)
	const [[countRow]] = await pool.query<RowDataPacket[]>(
		`SELECT COUNT(1) AS total FROM VENDA v WHERE ${whereClause}`,
		[pessoaId],
	)

	const vendaIds = rows.map((row) => row.venda_id)
	const itemsMap = await fetchItemsMap(vendaIds)
	const historyMap = await fetchHistoryMap(vendaIds)
	await ensureHistoryRecords(rows, historyMap)
	const feedbackMap = await fetchFeedbackMap(vendaIds)
	const complaintMap = await fetchComplaintMap(vendaIds)

	const data = rows.map((row) =>
		mapVendaRow(
			row,
			itemsMap.get(row.venda_id) || [],
			historyMap.get(row.venda_id) || [],
			feedbackMap.get(row.venda_id) || undefined,
			complaintMap.get(row.venda_id) || undefined,
		),
	)

	return {
		data,
		meta: {
			page,
			limit,
			total: Number(countRow?.total ?? data.length),
			totalPages: Math.max(1, Math.ceil(Number(countRow?.total ?? data.length) / limit)),
		},
	}
}

const insertNotification = async (executor: Queryable, input: NotificationInput) => {
	await executor.query<ResultSetHeader>(
		`INSERT INTO NOTIFICACAO
			(PESSOA_pessoa_id, titulo, mensagem, notificacao_tipo, destinatario_tipo, venda_id, rota_destino, payload, lida)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
		[
			input.pessoaId,
			input.titulo,
			input.mensagem,
			input.tipo,
			input.destinatarioTipo,
			input.vendaId ?? null,
			input.rotaDestino ?? null,
			input.payload ? JSON.stringify(input.payload) : null,
		],
	)
}

const validateStage = (value: any): SaleStage => {
	if (typeof value !== 'string') {
		throw new HttpError(400, 'Etapa inválida.')
	}
	const stage = value as SaleStage
	if (!SALE_STAGE_FLOW.includes(stage)) {
		throw new HttpError(400, 'Etapa de venda não reconhecida.')
	}
	return stage
}

const canAdvanceStage = (current: SaleStage, next: SaleStage) => {
	const currentIndex = SALE_STAGE_FLOW.indexOf(current)
	const nextIndex = SALE_STAGE_FLOW.indexOf(next)
	return nextIndex >= currentIndex && nextIndex - currentIndex <= 1
}

const formatStageLabel = (stage: SaleStage) => stage.replace(/_/g, ' ').toLowerCase()

const validateComplaintStatus = (value: any): ComplaintStatus => {
	if (typeof value !== 'string') {
		throw new HttpError(400, 'Status de reclamação inválido.')
	}
	const normalized = value.toUpperCase() as ComplaintStatus
	if (!COMPLAINT_STATUS_FLOW.includes(normalized)) {
		throw new HttpError(400, 'Status de reclamação não reconhecido.')
	}
	return normalized
}

const resolveActorContext = (req: Request) => {
	const userData = (req as any)?.user
	const fallbackId = req.body?.pessoaId ?? req.body?.actorId ?? null
	const fallbackTipo = req.body?.actorTipo ?? null
	return {
		id: userData?.id ? Number(userData.id) : fallbackId ? Number(fallbackId) : null,
		tipo: userData?.tipo ?? fallbackTipo ?? null,
	}
}

const salesForSupplierHandler = async (req: Request, res: Response) => {
	try {
		const pessoaId = parseIntParam(req.params.pessoaId)
		const limit = req.query.limit ? Number(req.query.limit) : undefined
		const page = req.query.page ? Number(req.query.page) : undefined
		const result = await listVendas('fornecedor', pessoaId, { limit, page })
		res.json(result)
	} catch (error) {
		respondError(res, error)
	}
}

const salesForClientHandler = async (req: Request, res: Response) => {
	try {
		const pessoaId = parseIntParam(req.params.pessoaId)
		const limit = req.query.limit ? Number(req.query.limit) : undefined
		const page = req.query.page ? Number(req.query.page) : undefined
		const result = await listVendas('cliente', pessoaId, { limit, page })
		res.json(result)
	} catch (error) {
		respondError(res, error)
	}
}

const saleDetailHandler = async (req: Request, res: Response) => {
	try {
		const vendaId = parseIntParam(req.params.id)
		const venda = await buildVendaDetail(vendaId)
		if (!venda) {
			throw new HttpError(404, 'Venda não encontrada.')
		}
		res.json(venda)
	} catch (error) {
		respondError(res, error)
	}
}

const saleStatusHandler = async (req: Request, res: Response) => {
	try {
		const vendaId = parseIntParam(req.params.id)
		const venda = await buildVendaDetail(vendaId)
		if (!venda) {
			throw new HttpError(404, 'Venda não encontrada.')
		}
		res.json({ venda_id: venda.vendaId, etapa: venda.etapa, status: venda.status })
	} catch (error) {
		respondError(res, error)
	}
}

const updateStageHandler = async (req: Request, res: Response) => {
	const connection = await pool.getConnection()
	try {
		const vendaId = parseIntParam(req.params.id)
		const stage = validateStage(req.body?.stage)
		const descricao = typeof req.body?.descricao === 'string' ? req.body.descricao : null
		const actorId = req.body?.actorId ? Number(req.body.actorId) : null

		await connection.beginTransaction()
		const venda = await buildVendaDetail(vendaId, connection, true)
		if (!venda) {
			throw new HttpError(404, 'Venda não encontrada.')
		}

		const currentStage = validateStage(venda.etapa)
		if (!canAdvanceStage(currentStage, stage)) {
			throw new HttpError(400, 'Não é possível avançar para esta etapa a partir da etapa atual.')
		}

		const newStatus = stage === 'PRODUTOS_ENTREGUES' ? 'CONCLUIDA' : venda.status

		await connection.query(
			`UPDATE VENDA SET venda_etapa = ?, venda_status = ? WHERE venda_id = ?`,
			[stage, newStatus, vendaId],
		)

		await connection.query(
			`INSERT INTO VENDA_ETAPA_HISTORICO (VENDA_venda_id, etapa, descricao, registrado_por)
			 VALUES (?, ?, ?, ?)`,
			[vendaId, stage, descricao, actorId],
		)

		const notificationType = stage === 'PRODUTOS_ENTREGUES' ? 'VENDA_CONCLUIDA' : 'VENDA_ETAPA_ATUALIZADA'
		const notificationTitle = stage === 'PRODUTOS_ENTREGUES' ? 'Pedido entregue' : 'Pedido atualizado'
		const notificationMessage =
			stage === 'PRODUTOS_ENTREGUES'
				? 'Seu pedido foi finalizado pelo fornecedor.'
				: `Seu pedido avançou para a etapa ${formatStageLabel(stage)}.`

		await insertNotification(connection, {
			pessoaId: venda.cliente.id,
			titulo: notificationTitle,
			mensagem: notificationMessage,
			tipo: notificationType,
			destinatarioTipo: 'CLIENTE',
			vendaId,
			rotaDestino: 'MinhasCompras',
			payload: { vendaId, etapa: stage },
		})

		await connection.commit()

		const updated = await buildVendaDetail(vendaId)
		res.json(updated)
	} catch (error) {
		await connection.rollback()
		respondError(res, error)
	} finally {
		connection.release()
	}
}

const createComplaintHandler = async (req: Request, res: Response) => {
	const vendaId = parseIntParam(req.params.id)
	const motivo = typeof req.body?.motivo === 'string' ? req.body.motivo.trim() : ''
	const itensPayload = Array.isArray(req.body?.itens) ? req.body.itens : []
	const actor = resolveActorContext(req)

	if (!actor.id) {
		throw new HttpError(401, 'Usuário não identificado para registrar a reclamação.')
	}
	if (!motivo) {
		throw new HttpError(400, 'Informe o motivo da reclamação.')
	}

	const normalizedItems: ComplaintItemInput[] = itensPayload
		.map((item: any): ComplaintItemInput => ({
			loteId: Number(item?.loteId ?? item?.lote_id),
			quantidade: Number(item?.quantidade ?? item?.qtde ?? 0),
		}))
		.filter((item: ComplaintItemInput) => Number.isInteger(item.loteId) && Number.isFinite(item.quantidade) && item.quantidade > 0)

	if (!normalizedItems.length) {
		throw new HttpError(400, 'Selecione pelo menos um item válido para a devolução.')
	}

	const connection = await pool.getConnection()
	try {
		await connection.beginTransaction()
		const venda = await buildVendaDetail(vendaId, connection, true)
		if (!venda) {
			throw new HttpError(404, 'Pedido não encontrado para registrar a reclamação.')
		}
		if (!venda.cliente || venda.cliente.id !== actor.id) {
			throw new HttpError(403, 'Este pedido não pertence ao usuário autenticado.')
		}
		if (venda.etapa !== 'PRODUTOS_ENTREGUES') {
			throw new HttpError(400, 'Reclamações só podem ser abertas após a conclusão do pedido.')
		}

		const activeComplaintMap = await fetchComplaintMap([vendaId], connection)
		const activeComplaint = activeComplaintMap.get(vendaId)
		if (activeComplaint && ['PENDENTE', 'ANALISE'].includes(activeComplaint.status)) {
			throw new HttpError(409, 'Já existe uma reclamação em análise para este pedido.')
		}

		const itensPorLote = new Map<number, { quantidade: number }>()
		venda.itens.forEach((item) => {
			itensPorLote.set(item.loteId, { quantidade: Number(item.quantidade) })
		})

		normalizedItems.forEach((item) => {
			const vendaItem = itensPorLote.get(item.loteId)
			if (!vendaItem) {
				throw new HttpError(400, `O lote ${item.loteId} não pertence a este pedido.`)
			}
			if (item.quantidade > vendaItem.quantidade) {
				throw new HttpError(
					400,
					`Quantidade informada (${item.quantidade}) excede o adquirido no lote ${item.loteId} (${vendaItem.quantidade}).`,
				)
			}
		})

		const [result] = await connection.query<ResultSetHeader>(
			`INSERT INTO DEVOLUCAO (devolucao_motivo, devolucao_status, VENDA_venda_id) VALUES (?, 'ANALISE', ?)`,
			[motivo, vendaId],
		)
		const devolucaoId = result.insertId

		const valores = normalizedItems.map((item) => [devolucaoId, item.loteId, item.quantidade])
		await connection.query<ResultSetHeader>(
			`INSERT INTO ITEM_DEVOLUCAO (DEVOLUCAO_devolucao_id, LOTEPROD_lote_id, itemDevolucao_qtde) VALUES ?`,
			[valores],
		)

		if (venda.fornecedor?.id) {
			await insertNotification(connection, {
				pessoaId: venda.fornecedor.id,
				titulo: 'Nova reclamação recebida',
				mensagem: `O cliente abriu uma reclamação para o pedido #${vendaId}.`,
				tipo: 'VENDA_RECLAMACAO',
				destinatarioTipo: 'FORNECEDOR',
				vendaId,
				rotaDestino: 'HistoricoVendas',
				payload: { devolucaoId, vendaId },
			})
		}

		await connection.commit()
		res.status(201).json({
			id: devolucaoId,
			vendaId,
			status: 'ANALISE',
			motivo,
			criadoEm: new Date(),
		})
	} catch (error) {
		await connection.rollback()
		respondError(res, error)
	} finally {
		connection.release()
	}
}

const updateComplaintStatusHandler: RequestHandler = async (req, res) => {
	const devolucaoId = parseIntParam(req.params.id)
	const status = validateComplaintStatus(req.body?.status)
	const actor = resolveActorContext(req)
	if (!actor.id) {
		throw new HttpError(401, 'Usuário não identificado para atualizar a reclamação.')
	}

	const connection = await pool.getConnection()
	try {
		await connection.beginTransaction()
		const [rows] = await connection.query<RowDataPacket[]>(
			`SELECT
				d.devolucao_id,
				d.devolucao_motivo,
				d.VENDA_venda_id AS venda_id,
				d.devolucao_status,
				v.PESSOA_pessoa_id AS cliente_id,
				COALESCE(v.fornecedor_pessoa_id, pr.JURIDICA_PESSOA_pessoa_id) AS fornecedor_id,
				v.venda_status,
				v.PROMOCAO_promocao_id AS promocao_id
			FROM DEVOLUCAO d
			JOIN VENDA v ON v.venda_id = d.VENDA_venda_id
			LEFT JOIN PROMOCAO pr ON pr.promocao_id = v.PROMOCAO_promocao_id
			WHERE d.devolucao_id = ?
			FOR UPDATE`,
			[devolucaoId],
		)
		if (!rows.length) {
			throw new HttpError(404, 'Reclamação não encontrada.')
		}

		const complaint = rows[0]
		const fornecedorId = complaint.fornecedor_id ? Number(complaint.fornecedor_id) : null
		const promocaoId = complaint.promocao_id ? Number(complaint.promocao_id) : null
		if (!fornecedorId) {
			throw new HttpError(400, 'Não foi possível identificar o fornecedor responsável pelo pedido.')
		}
		const isAuthorized = actor.tipo === 'Admin' || actor.id === fornecedorId
		if (!isAuthorized) {
			throw new HttpError(403, 'Somente o fornecedor responsável ou um administrador podem atualizar a reclamação.')
		}

		if (complaint.devolucao_status === status) {
			res.json({ id: devolucaoId, status, vendaId: complaint.venda_id })
			return
		}

		if (status === 'APROVADA') {
			await connection.query<ResultSetHeader>(
				`UPDATE DEVOLUCAO SET devolucao_status = ?, devolucao_data = CURRENT_TIMESTAMP WHERE devolucao_id = ?`,
				[status, devolucaoId],
			)
		} else {
			await connection.query<ResultSetHeader>(
				`UPDATE DEVOLUCAO SET devolucao_status = ? WHERE devolucao_id = ?`,
				[status, devolucaoId],
			)
		}

		if (status === 'APROVADA' && complaint.devolucao_status !== 'APROVADA') {
			const [items] = await connection.query<RowDataPacket[]>(
				`SELECT LOTEPROD_lote_id AS lote_id, itemDevolucao_qtde AS quantidade FROM ITEM_DEVOLUCAO WHERE DEVOLUCAO_devolucao_id = ?`,
				[devolucaoId],
			)
			for (const item of items) {
				await connection.query<ResultSetHeader>(
					`UPDATE LOTEPROD SET lote_quantidade_atual = lote_quantidade_atual + ? WHERE lote_id = ?`,
					[item.quantidade, item.lote_id],
				)
				if (promocaoId) {
					await connection.query<ResultSetHeader>(
						`UPDATE ITEM_PROMOCAO SET itemPromocao_qtde = itemPromocao_qtde + ? WHERE PROMOCAO_promocao_id = ? AND LOTEPROD_lote_id = ?`,
						[item.quantidade, promocaoId, item.lote_id],
					)
				}
			}
			if (complaint.venda_status === 'CONCLUIDA') {
				await connection.query<ResultSetHeader>(
					`UPDATE VENDA SET venda_status = 'CANCELADA' WHERE venda_id = ?`,
					[complaint.venda_id],
				)
			}
		}

		if (status === 'APROVADA' || status === 'REJEITADA') {
			await registerComplaintEvaluation(
				connection,
				{
					devolucao_id: Number(complaint.devolucao_id),
					venda_id: Number(complaint.venda_id),
					cliente_id: Number(complaint.cliente_id),
					promocao_id: promocaoId,
					motivo: complaint.devolucao_motivo || null,
				},
				status,
				actor,
			)
		}

		const titulo = status === 'APROVADA' ? 'Reclamação aprovada' : 'Atualização na reclamação'
		const mensagem =
			status === 'APROVADA'
				? `Seu pedido #${complaint.venda_id} teve a reclamação aprovada. Iniciaremos o processo de reembolso.`
				: `Sua reclamação sobre o pedido #${complaint.venda_id} foi atualizada para ${status}.`

		await insertNotification(connection, {
			pessoaId: Number(complaint.cliente_id),
			titulo,
			mensagem,
			tipo: 'VENDA_RECLAMACAO_ATUALIZADA',
			destinatarioTipo: 'CLIENTE',
			vendaId: complaint.venda_id,
			rotaDestino: 'MinhasCompras',
			payload: { devolucaoId, status },
		})

		await connection.commit()
		res.json({ id: devolucaoId, status, vendaId: complaint.venda_id })
		return
	} catch (error) {
		await connection.rollback()
		respondError(res, error)
	} finally {
		connection.release()
	}
}

const complaintsReportHandler: RequestHandler = async (req, res) => {
	try {
		const limit = Math.min(Math.max(Number(req.query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT)
		const page = Math.max(Number(req.query.page) || 1, 1)
		const offset = (page - 1) * limit
		const statusParam = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status
		const statusFilter = statusParam ? validateComplaintStatus(statusParam) : null
		const searchRaw = typeof req.query.search === 'string' ? req.query.search.trim() : ''
		const startDateRaw = typeof req.query.startDate === 'string' ? req.query.startDate.trim() : ''
		const endDateRaw = typeof req.query.endDate === 'string' ? req.query.endDate.trim() : ''
		const fornecedorRaw = Array.isArray(req.query.fornecedorId) ? req.query.fornecedorId[0] : req.query.fornecedorId
		const clienteRaw = Array.isArray(req.query.clienteId) ? req.query.clienteId[0] : req.query.clienteId
		const fornecedorId = fornecedorRaw ? Number(fornecedorRaw) : null
		const clienteId = clienteRaw ? Number(clienteRaw) : null
		if (fornecedorRaw && Number.isNaN(fornecedorId)) {
			throw new HttpError(400, 'Identificador de fornecedor inválido.')
		}
		if (clienteRaw && Number.isNaN(clienteId)) {
			throw new HttpError(400, 'Identificador de cliente inválido.')
		}
		const conditions: string[] = []
		const params: any[] = []
		if (fornecedorId) {
			conditions.push('COALESCE(v.fornecedor_pessoa_id, pr.JURIDICA_PESSOA_pessoa_id) = ?')
			params.push(fornecedorId)
		}
		if (clienteId) {
			conditions.push('v.PESSOA_pessoa_id = ?')
			params.push(clienteId)
		}
		const fornecedorNomeRaw = Array.isArray(req.query.fornecedorNome)
			? req.query.fornecedorNome[0]
			: (req.query.fornecedorNome as string | undefined)
		const clienteNomeRaw = Array.isArray(req.query.clienteNome)
			? req.query.clienteNome[0]
			: (req.query.clienteNome as string | undefined)
		const fornecedorNome = typeof fornecedorNomeRaw === 'string' ? fornecedorNomeRaw.trim() : undefined
		if (fornecedorNome) {
			conditions.push('forn.pessoa_nome LIKE ?')
			params.push(`%${fornecedorNome}%`)
		}
		const clienteNome = typeof clienteNomeRaw === 'string' ? clienteNomeRaw.trim() : undefined
		if (clienteNome) {
			conditions.push('cli.pessoa_nome LIKE ?')
			params.push(`%${clienteNome}%`)
		}
		if (statusFilter) {
			conditions.push('d.devolucao_status = ?')
			params.push(statusFilter)
		}
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/
		if (startDateRaw) {
			if (!dateRegex.test(startDateRaw)) {
				throw new HttpError(400, 'Data inicial inválida. Use o formato AAAA-MM-DD.')
			}
			conditions.push('DATE(d.devolucao_data) >= ?')
			params.push(startDateRaw)
		}
		if (endDateRaw) {
			if (!dateRegex.test(endDateRaw)) {
				throw new HttpError(400, 'Data final inválida. Use o formato AAAA-MM-DD.')
			}
			conditions.push('DATE(d.devolucao_data) <= ?')
			params.push(endDateRaw)
		}
		if (searchRaw) {
			const searchWildcard = `%${searchRaw}%`
			const numericSearch = Number(searchRaw)
			const searchConditions = [
				'cli.pessoa_nome LIKE ?',
				'forn.pessoa_nome LIKE ?',
				'pr.promocao_descricao LIKE ?',
				'd.devolucao_motivo LIKE ?',
			]
			const searchParams: Array<string | number> = [searchWildcard, searchWildcard, searchWildcard, searchWildcard]
			if (!Number.isNaN(numericSearch)) {
				searchConditions.push('v.venda_id = ?')
				searchConditions.push('d.devolucao_id = ?')
				searchParams.push(numericSearch, numericSearch)
			}
			conditions.push(`(${searchConditions.join(' OR ')})`)
			params.push(...searchParams)
		}
		const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
		const [rows] = await pool.query<ComplaintReportRow[]>(
			`SELECT
				d.devolucao_id,
				d.devolucao_data,
				d.devolucao_motivo,
				d.devolucao_status,
				v.venda_id,
				v.venda_total,
				v.venda_status,
				v.PROMOCAO_promocao_id AS promocao_id,
				pr.promocao_descricao,
				cli.pessoa_id AS cliente_id,
				cli.pessoa_nome AS cliente_nome,
				cli.pessoa_email AS cliente_email,
				forn.pessoa_id AS fornecedor_id,
				forn.pessoa_nome AS fornecedor_nome
			${COMPLAINT_REPORT_BASE_FROM}
			${whereClause}
			ORDER BY d.devolucao_data DESC
			LIMIT ? OFFSET ?`,
			[...params, limit, offset],
		)
		const complaintIds = rows.map((row) => row.devolucao_id)
		const itemsMap = await fetchComplaintItemsById(complaintIds)
		const data = rows.map((row) => ({
			id: row.devolucao_id,
			vendaId: row.venda_id,
			status: row.devolucao_status,
			motivo: row.devolucao_motivo,
			criadoEm: row.devolucao_data,
			valorTotal: Number(row.venda_total || 0),
			cliente: {
				id: row.cliente_id,
				nome: row.cliente_nome,
				email: row.cliente_email,
			},
			fornecedor: row.fornecedor_id
				? { id: Number(row.fornecedor_id), nome: row.fornecedor_nome || 'Fornecedor não identificado' }
				: null,
			promocao: row.promocao_id
				? { id: Number(row.promocao_id), descricao: row.promocao_descricao }
				: null,
			itens: (itemsMap.get(row.devolucao_id) || []).map((item) => ({
				loteId: item.loteId,
				quantidade: item.quantidade,
				produtoNome: item.produtoNome,
			})),
		}))
		const [[countRow]] = await pool.query<RowDataPacket[]>(
			`SELECT COUNT(*) AS total ${COMPLAINT_REPORT_BASE_FROM} ${whereClause}`,
			params,
		)
		const total = Number(countRow?.total ?? 0)
		const [[statsRow]] = await pool.query<RowDataPacket[]>(
			`SELECT
				SUM(CASE WHEN d.devolucao_status = 'PENDENTE' THEN 1 ELSE 0 END) AS pendente,
				SUM(CASE WHEN d.devolucao_status = 'ANALISE' THEN 1 ELSE 0 END) AS analise,
				SUM(CASE WHEN d.devolucao_status = 'APROVADA' THEN 1 ELSE 0 END) AS aprovada,
				SUM(CASE WHEN d.devolucao_status = 'REJEITADA' THEN 1 ELSE 0 END) AS rejeitada
			${COMPLAINT_REPORT_BASE_FROM}
			${whereClause}`,
			params,
		)
		const stats = {
			pendente: Number(statsRow?.pendente ?? 0),
			analise: Number(statsRow?.analise ?? 0),
			aprovada: Number(statsRow?.aprovada ?? 0),
			rejeitada: Number(statsRow?.rejeitada ?? 0),
		}
		res.json({
			data,
			page,
			limit,
			total,
			totalPages: total > 0 ? Math.ceil(total / limit) : 0,
			stats,
		})
	} catch (error) {
		respondError(res, error)
	}
}

const feedbackReportHandler = async (req: Request, res: Response) => {
	const fornecedorId = req.query.fornecedorId ? Number(req.query.fornecedorId) : null
	const clienteId = req.query.clienteId ? Number(req.query.clienteId) : null
	const limit = Math.min(Math.max(Number(req.query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT)
	const page = Math.max(Number(req.query.page) || 1, 1)
	const offset = (page - 1) * limit

	const conditions: string[] = []
	const params: any[] = []
	if (fornecedorId) {
		conditions.push('COALESCE(v.fornecedor_pessoa_id, pr.JURIDICA_PESSOA_pessoa_id) = ?')
		params.push(fornecedorId)
	}
	if (clienteId) {
		conditions.push('a.PESSOA_pessoa_id = ?')
		params.push(clienteId)
	}
	const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

	const [rows] = await pool.query<RowDataPacket[]>(
		`SELECT
			a.avaliacao_id,
			a.avaliacao_data,
			a.VENDA_venda_id AS venda_id,
			cli.pessoa_nome AS cliente_nome,
			forn.pessoa_nome AS fornecedor_nome,
			pr.promocao_id,
			pr.promocao_descricao,
			v.venda_total,
			AVG(na.avaliacao_nota) AS media_nota,
			GROUP_CONCAT(DISTINCT p.produto_nome ORDER BY p.produto_nome SEPARATOR ' | ') AS produtos
		FROM AVALIACAO a
		JOIN VENDA v ON v.venda_id = a.VENDA_venda_id
		JOIN PESSOA cli ON cli.pessoa_id = a.PESSOA_pessoa_id
		LEFT JOIN PROMOCAO pr ON pr.promocao_id = v.PROMOCAO_promocao_id
		LEFT JOIN PESSOA forn ON forn.pessoa_id = COALESCE(v.fornecedor_pessoa_id, pr.JURIDICA_PESSOA_pessoa_id)
		LEFT JOIN ITEM_VENDA iv ON iv.VENDA_venda_id = v.venda_id
		LEFT JOIN LOTEPROD lp ON lp.lote_id = iv.LOTEPROD_lote_id
		LEFT JOIN PRODUTO p ON p.produto_id = lp.produto_id
		LEFT JOIN NOTA_AVALIACAO na ON na.AVALIACAO_avaliacao_id = a.avaliacao_id
		${whereClause}
		GROUP BY a.avaliacao_id
		ORDER BY a.avaliacao_data DESC
		LIMIT ? OFFSET ?`,
		[...params, limit, offset],
	)

	const [[countRow]] = await pool.query<RowDataPacket[]>(
		`SELECT COUNT(DISTINCT a.avaliacao_id) AS total
		FROM AVALIACAO a
		JOIN VENDA v ON v.venda_id = a.VENDA_venda_id
		LEFT JOIN PROMOCAO pr ON pr.promocao_id = v.PROMOCAO_promocao_id
		${whereClause}`,
		params,
	)

	const data = rows.map((row) => ({
		avaliacaoId: row.avaliacao_id,
		vendaId: row.venda_id,
		clienteNome: row.cliente_nome,
		fornecedorNome: row.fornecedor_nome,
		promocaoDescricao: row.promocao_descricao,
		produtos: row.produtos ? String(row.produtos).split(' | ') : [],
		mediaNota: row.media_nota ? Number(row.media_nota) : null,
		valorVenda: Number(row.venda_total || 0),
		criadoEm: row.avaliacao_data,
	}))

	res.json({
		data,
		meta: {
			page,
			limit,
			total: Number(countRow?.total ?? data.length),
			totalPages: Math.max(1, Math.ceil(Number(countRow?.total ?? data.length) / limit)),
		},
	})
}

router.get('/suppliers/:pessoaId/sales', salesForSupplierHandler)
router.get('/clients/:pessoaId/sales', salesForClientHandler)
router.get('/sales/:id', saleDetailHandler)
router.get('/sales/:id/status', saleStatusHandler)
router.put('/sales/:id/stage', updateStageHandler)
router.post('/sales/:id/complaints', createComplaintHandler)
router.patch('/complaints/:id/status', updateComplaintStatusHandler)
router.get('/complaints/report', complaintsReportHandler)
router.get('/feedback/report', feedbackReportHandler)

export default router
