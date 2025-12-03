import express, { NextFunction, Request, Response } from 'express'
import { pool } from '../../infrastructure/database/mysql.connection'
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { AppError } from '../../common/errors/app-error'

const router = express.Router()

router.get('/:pessoaId', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const pessoaId = Number(req.params.pessoaId)
		if (!Number.isFinite(pessoaId)) {
			throw new AppError('ID de pessoa inválido.', 400)
		}
		const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100)

		const [rows] = await pool.query<RowDataPacket[]>(
			`SELECT notificacao_id, titulo, mensagem, notificacao_tipo, destinatario_tipo,
				venda_id, rota_destino, payload, lida, data_criacao
			 FROM NOTIFICACAO
			 WHERE PESSOA_pessoa_id = ?
			 ORDER BY data_criacao DESC
			 LIMIT ?`,
			[pessoaId, limit],
		)

		const data = rows.map((row) => {
			let parsedPayload: unknown = null
			const rawPayload = row.payload as unknown
			if (rawPayload !== undefined && rawPayload !== null) {
				if (typeof rawPayload === 'string') {
					try {
						parsedPayload = JSON.parse(rawPayload)
					} catch (parseError) {
						console.warn(
							`[NotificationRoutes] Falha ao converter payload da notificação ${row.notificacao_id}: ${parseError}`,
						)
						parsedPayload = null
					}
				} else if (typeof rawPayload === 'object') {
					parsedPayload = rawPayload
				}
			}

			return {
			notificacaoId: row.notificacao_id,
			titulo: row.titulo,
			mensagem: row.mensagem,
			tipo: row.notificacao_tipo,
			destinatarioTipo: row.destinatario_tipo,
			vendaId: row.venda_id,
			rotaDestino: row.rota_destino,
			payload: parsedPayload,
			lida: Boolean(row.lida),
			dataCriacao: row.data_criacao,
		}
		})

		res.json({ data })
	} catch (error) {
		next(error)
	}
})

router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const notificacaoId = Number(req.params.id)
		if (!Number.isFinite(notificacaoId)) {
			throw new AppError('ID da notificação inválido.', 400)
		}

		const [result] = await pool.query<ResultSetHeader>(
			`UPDATE NOTIFICACAO SET lida = 1 WHERE notificacao_id = ?`,
			[notificacaoId],
		)
		if (result.affectedRows === 0) {
			throw new AppError('Notificação não encontrada.', 404)
		}

		res.json({ ok: true })
	} catch (error) {
		next(error)
	}
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { pessoa_id, titulo, mensagem, notificacao_tipo, destinatario_tipo, venda_id, rota_destino, payload } = req.body || {}
		if (!pessoa_id || !titulo || !mensagem) {
			throw new AppError('Campos pessoa_id, titulo e mensagem são obrigatórios.', 400)
		}

		const [result] = await pool.query<ResultSetHeader>(
			`INSERT INTO NOTIFICACAO (PESSOA_pessoa_id, titulo, mensagem, notificacao_tipo, destinatario_tipo, venda_id, rota_destino, payload)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				Number(pessoa_id),
				titulo,
				mensagem,
				notificacao_tipo || 'VENDA_ATUALIZADA',
				destinatario_tipo || 'CLIENTE',
				venda_id ?? null,
				rota_destino ?? null,
				payload ? JSON.stringify(payload) : null,
			],
		)

		res.status(201).json({ notificacaoId: result.insertId })
	} catch (error) {
		next(error)
	}
})

export default router
