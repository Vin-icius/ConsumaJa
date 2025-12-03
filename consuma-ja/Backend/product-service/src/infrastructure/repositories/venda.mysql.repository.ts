import { VendaRepository, CreateVendaRepoData } from '../../domain/repositories/venda.repository';
import { Venda } from '../../domain/entities/venda.entity';
import { pool } from '../database/mysql.connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { AppError } from '../../common/errors/app-error';

const insertSupplierNotification = async (
  connection: PoolConnection,
  fornecedorId: number | null,
  vendaId: number,
) => {
  if (!fornecedorId) {
    return;
  }

  await connection.query(
    `INSERT INTO NOTIFICACAO
      (PESSOA_pessoa_id, titulo, mensagem, notificacao_tipo, destinatario_tipo, venda_id, rota_destino, payload, lida)
     VALUES (?, 'Nova venda registrada', ?, 'VENDA_NOVA_FORNECEDOR', 'FORNECEDOR', ?, 'HistoricoVendas', ?, 0)`,
    [
      fornecedorId,
      `O pedido #${vendaId} foi confirmado e aguarda processamento.`,
      vendaId,
      JSON.stringify({ vendaId }),
    ],
  );
};

export class VendaMySQLRepository implements VendaRepository {
  async criar(data: CreateVendaRepoData): Promise<Venda> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const vendaQuery = `
        INSERT INTO VENDA (
          venda_data,
          venda_total,
          venda_status,
          PROMOCAO_promocao_id,
          PESSOA_pessoa_id,
          fornecedor_pessoa_id,
          ENDERECO_endereco_id,
          retirada_no_fornecedor,
          metodo_pagamento,
          parcelas,
          detalhes_pagamento
        )
        VALUES (?, ?, 'EM ANDAMENTO', ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const detalhesPagamentoJson = data.detalhes_pagamento ? JSON.stringify(data.detalhes_pagamento) : null;
      const parcelas = Number.isFinite(data.parcelas) && data.parcelas ? data.parcelas : 1;
      const [vendaResult] = await connection.query<ResultSetHeader>(vendaQuery, [
        data.venda_data,
        data.venda_total,
        data.promocao_id,
        data.pessoa_id,
        data.fornecedor_pessoa_id,
        data.endereco_id,
        data.retirada_no_fornecedor ? 1 : 0,
        data.metodo_pagamento ?? null,
        parcelas,
        detalhesPagamentoJson,
      ]);
      const vendaId = vendaResult.insertId;

      for (const item of data.itens) {
        const [loteRows] = await connection.query<RowDataPacket[]>(
          'SELECT lote_quantidade_atual FROM LOTEPROD WHERE lote_id = ? AND ativo = TRUE',
          [item.lote_id]
        );
        if (loteRows.length === 0) throw new AppError(`Lote ${item.lote_id} não encontrado ou inativo.`, 400);
        const estoqueAtual = loteRows[0].lote_quantidade_atual;
        if (estoqueAtual < item.quantidade) throw new AppError(`Estoque insuficiente para lote ${item.lote_id}. Disponível: ${estoqueAtual}`, 400);

        const [promoRows] = await connection.query<RowDataPacket[]>(
          'SELECT itemPromocao_qtde FROM ITEM_PROMOCAO WHERE PROMOCAO_promocao_id = ? AND LOTEPROD_lote_id = ? FOR UPDATE',
          [data.promocao_id, item.lote_id]
        );
        if (promoRows.length === 0) {
          throw new AppError(`Item da promoção não encontrado para o lote ${item.lote_id}.`, 400);
        }
        const promocaoQtdeAtual = promoRows[0].itemPromocao_qtde;
        if (promocaoQtdeAtual < item.quantidade) {
          throw new AppError(`Quantidade solicitada excede o disponível na promoção para o lote ${item.lote_id}.`, 400);
        }

        await connection.query(
          'INSERT INTO ITEM_VENDA (itemVenda_qtde, itemVenda_preco, LOTEPROD_lote_id, VENDA_venda_id) VALUES (?, ?, ?, ?)',
          [item.quantidade, item.valor_unitario, item.lote_id, vendaId]
        );

        await connection.query(
          'UPDATE LOTEPROD SET lote_quantidade_atual = lote_quantidade_atual - ? WHERE lote_id = ?',
          [item.quantidade, item.lote_id]
        );
      }

      await connection.query(
        `INSERT INTO VENDA_ETAPA_HISTORICO (VENDA_venda_id, etapa, descricao, registrado_por)
         VALUES (?, 'SEPARANDO_PRODUTOS', 'Pedido registrado e aguardando processamento.', NULL)`,
        [vendaId]
      );

      await insertSupplierNotification(connection, data.fornecedor_pessoa_id ?? null, vendaId);

      await connection.commit();

      return {
        venda_id: vendaId,
        venda_data: data.venda_data,
        venda_total: data.venda_total,
        venda_status: 'EM ANDAMENTO',
        promocao_id: data.promocao_id,
        fornecedor_pessoa_id: data.fornecedor_pessoa_id,
        pessoa_id: data.pessoa_id,
        endereco_id: data.endereco_id,
        retirada_no_fornecedor: data.retirada_no_fornecedor,
        metodo_pagamento: data.metodo_pagamento ?? null,
        parcelas,
        detalhes_pagamento: data.detalhes_pagamento ?? null,
        itens: data.itens.map(item => ({
          lote_id: item.lote_id,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          promocao_id: 0 // Não usado aqui
        }))
      };
    } catch (error: any) {
      await connection.rollback();
      console.error('[Repo Venda] Erro ao criar venda:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Erro no BD ao criar venda.', 500, false);
    } finally {
      connection.release();
    }
  }

  async buscarPorId(vendaId: number): Promise<Venda | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        v.venda_id,
        v.venda_data,
        v.venda_total,
        v.venda_status,
        v.PROMOCAO_promocao_id,
        v.PESSOA_pessoa_id,
        COALESCE(v.fornecedor_pessoa_id, pr.JURIDICA_PESSOA_pessoa_id) AS fornecedor_responsavel,
        v.ENDERECO_endereco_id,
        v.retirada_no_fornecedor,
        v.metodo_pagamento,
        v.parcelas,
        v.detalhes_pagamento
       FROM VENDA v
       LEFT JOIN PROMOCAO pr ON pr.promocao_id = v.PROMOCAO_promocao_id
       WHERE v.venda_id = ?`,
      [vendaId],
    );

    if (rows.length === 0) {
      return null;
    }

    const vendaRow = rows[0];
    let detalhesPagamento: Record<string, any> | null = null;
    if (vendaRow.detalhes_pagamento) {
      try {
        detalhesPagamento = JSON.parse(vendaRow.detalhes_pagamento as string);
      } catch (error) {
        console.warn('[VendaRepository] Falha ao converter detalhes_pagamento', error);
      }
    }

    return {
      venda_id: vendaRow.venda_id,
      venda_data: vendaRow.venda_data,
      venda_total: vendaRow.venda_total,
      venda_status: vendaRow.venda_status,
      promocao_id: vendaRow.PROMOCAO_promocao_id ?? null,
      fornecedor_pessoa_id: vendaRow.fornecedor_responsavel,
      pessoa_id: vendaRow.PESSOA_pessoa_id,
      endereco_id: vendaRow.ENDERECO_endereco_id ?? null,
      retirada_no_fornecedor: Boolean(vendaRow.retirada_no_fornecedor),
      metodo_pagamento: vendaRow.metodo_pagamento ?? null,
      parcelas: vendaRow.parcelas ?? 1,
      detalhes_pagamento: detalhesPagamento,
      itens: [],
    };
  }
}