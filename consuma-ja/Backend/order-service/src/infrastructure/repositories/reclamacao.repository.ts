import { pool } from '../database/mysql.connection';
import { Reclamacao } from '../../domain/entities/reclamacao.entity';

export class ReclamacaoRepository {
  // Estória 15: Criar Reclamação
  async create(reclamacao: Partial<Reclamacao>): Promise<void> {
    const sql = `
      INSERT INTO RECLAMACAO (titulo, descricao, classificacao, status, venda_venda_id, pessoa_pessoa_id)
      VALUES (?, ?, ?, 'PENDENTE', ?, ?)
    `;
    await pool.execute(sql, [
      reclamacao.titulo,
      reclamacao.descricao,
      reclamacao.classificacao,
      reclamacao.venda_id,
      reclamacao.pessoa_id
    ]);
  }

  // Listar (Para Admin e Usuário)
  async findAll(): Promise<any[]> {
    const [rows] = await pool.execute(`
      SELECT r.*, p.pessoa_nome 
      FROM RECLAMACAO r
      JOIN PESSOA p ON r.pessoa_pessoa_id = p.pessoa_id
      ORDER BY r.data_abertura DESC
    `);
    return rows as any[];
  }

  async findById(id: number): Promise<any> {
    const [rows]: any = await pool.execute('SELECT * FROM RECLAMACAO WHERE reclamacao_id = ?', [id]);
    return rows[0];
  }

  // Estória 16: Aprovar/Rejeitar (Atualizar status e resposta)
  async updateStatus(id: number, status: string, resposta: string): Promise<void> {
    const sql = `
      UPDATE RECLAMACAO 
      SET status = ?, resposta_admin = ?, data_fechamento = NOW()
      WHERE reclamacao_id = ?
    `;
    await pool.execute(sql, [status, resposta, id]);
  }
}