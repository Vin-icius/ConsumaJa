import { VendaRepository, CreateVendaRepoData } from '../../domain/repositories/venda.repository';
import { Venda } from '../../domain/entities/venda.entity';
import { pool } from '../database/mysql.connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { AppError } from '../../common/errors/app-error';

export class VendaMySQLRepository implements VendaRepository {
  async criar(data: CreateVendaRepoData): Promise<Venda> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Inserir VENDA
      const vendaQuery = `
        INSERT INTO VENDA (venda_data, venda_total, venda_status, PESSOA_pessoa_id, ENDERECO_endereco_id)
        VALUES (?, ?, 'EM ANDAMENTO', ?, ?)
      `;
      const [vendaResult] = await connection.query<ResultSetHeader>(vendaQuery, [
        data.venda_data, data.venda_total, data.pessoa_id, data.endereco_id
      ]);
      const vendaId = vendaResult.insertId;

      // Inserir ITEM_VENDA e atualizar LOTEPROD
      for (const item of data.itens) {
        // Verificar estoque
        const [loteRows] = await connection.query<RowDataPacket[]>(
          'SELECT lote_quantidade_atual FROM LOTEPROD WHERE lote_id = ? AND ativo = TRUE',
          [item.lote_id]
        );
        if (loteRows.length === 0) throw new AppError(`Lote ${item.lote_id} não encontrado ou inativo.`, 400);
        const estoqueAtual = loteRows[0].lote_quantidade_atual;
        if (estoqueAtual < item.quantidade) throw new AppError(`Estoque insuficiente para lote ${item.lote_id}. Disponível: ${estoqueAtual}`, 400);

        // Inserir ITEM_VENDA
        await connection.query(
          'INSERT INTO ITEM_VENDA (itemVenda_qtde, itemVenda_preco, LOTEPROD_lote_id, VENDA_venda_id) VALUES (?, ?, ?, ?)',
          [item.quantidade, item.valor_unitario, item.lote_id, vendaId]
        );

        // Atualizar estoque
        await connection.query(
          'UPDATE LOTEPROD SET lote_quantidade_atual = lote_quantidade_atual - ? WHERE lote_id = ?',
          [item.quantidade, item.lote_id]
        );
      }

      await connection.commit();

      // Retornar venda criada (simplificada, sem buscar itens)
      return {
        venda_id: vendaId,
        venda_data: data.venda_data,
        venda_total: data.venda_total,
        venda_status: 'EM ANDAMENTO',
        pessoa_id: data.pessoa_id,
        endereco_id: data.endereco_id,
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
}