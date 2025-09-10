import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { AppError } from '../../common/errors/app-error';
import { Avaliacao } from '../../domain/entities/avaliacao.entity';
import { AvaliacaoRepository, CreateAvaliacaoRepoData, UpdateAvaliacaoRepoData, PaginatedRepositoryResponse, AvaliacaoStats } from '../../domain/repositories/avaliacao.repository';
import { pool } from '../database/mysql.connection';

interface AvaliacaoRow extends Avaliacao, RowDataPacket {}

export class AvaliacaoMySQLRepository implements AvaliacaoRepository {

    private mapRowToAvaliacao(row: AvaliacaoRow): Avaliacao {
        return {
            ...row,
            data_criacao: new Date(row.data_criacao),
            data_atualizacao: new Date(row.data_atualizacao),
        };
    }

    async criar(data: CreateAvaliacaoRepoData): Promise<Avaliacao> {
        const query = `
            INSERT INTO AVALIACAO (produto_id, pessoa_id, pedido_id, nota, comentario)
            VALUES (?, ?, ?, ?, ?)
        `;
        try {
            const [result] = await pool.query<ResultSetHeader>(query, [
                data.produto_id, data.pessoa_id, data.pedido_id, data.nota, data.comentario
            ]);
            const insertedId = result.insertId;
            const novaAvaliacao = await this.buscarPorId(insertedId);
            if (!novaAvaliacao) {
                throw new AppError("Falha ao criar ou buscar avaliação após inserção.", 500);
            }
            return novaAvaliacao;
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new AppError("Você já avaliou este produto.", 409);
            }
            console.error("[Repo Avaliacao] Erro ao criar avaliação:", error);
            throw new AppError("Erro no banco de dados ao criar avaliação.", 500);
        }
    }

    async atualizar(avaliacao_id: number, pessoa_id: number, data: UpdateAvaliacaoRepoData): Promise<Avaliacao | null> {
        const fields = Object.keys(data);
        if (fields.length === 0) return this.buscarPorId(avaliacao_id);

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(data), avaliacao_id, pessoa_id];

        // O `pessoa_id` no WHERE garante que um usuário não possa editar a avaliação de outro
        const query = `UPDATE AVALIACAO SET ${setClause} WHERE avaliacao_id = ? AND pessoa_id = ?`;

        try {
            const [result] = await pool.query<ResultSetHeader>(query, values);
            if (result.affectedRows === 0) return null; // Não encontrou ou não pertence ao usuário
            return this.buscarPorId(avaliacao_id);
        } catch (error) {
            console.error(`[Repo Avaliacao] Erro ao atualizar avaliação ${avaliacao_id}:`, error);
            throw new AppError("Erro no banco de dados ao atualizar avaliação.", 500);
        }
    }

    async excluir(avaliacao_id: number, pessoa_id: number): Promise<boolean> {
        // O `pessoa_id` no WHERE é uma camada de segurança
        const query = "DELETE FROM AVALIACAO WHERE avaliacao_id = ? AND pessoa_id = ?";
        try {
            const [result] = await pool.query<ResultSetHeader>(query, [avaliacao_id, pessoa_id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`[Repo Avaliacao] Erro ao excluir avaliação ${avaliacao_id}:`, error);
            throw new AppError("Erro no banco de dados ao excluir avaliação.", 500);
        }
    }

    async buscarPorId(avaliacao_id: number): Promise<Avaliacao | null> {
        const query = "SELECT * FROM AVALIACAO WHERE avaliacao_id = ?";
        try {
            const [rows] = await pool.query<AvaliacaoRow[]>(query, [avaliacao_id]);
            return rows.length > 0 ? this.mapRowToAvaliacao(rows[0]) : null;
        } catch (error) {
            console.error(`[Repo Avaliacao] Erro ao buscar avaliação por ID ${avaliacao_id}:`, error);
            throw new AppError("Erro no banco de dados ao buscar avaliação.", 500);
        }
    }

    async buscarPorPessoaEProduto(pessoa_id: number, produto_id: number): Promise<Avaliacao | null> {
        const query = "SELECT * FROM AVALIACAO WHERE pessoa_id = ? AND produto_id = ? LIMIT 1";
        try {
            const [rows] = await pool.query<AvaliacaoRow[]>(query, [pessoa_id, produto_id]);
            return rows.length > 0 ? this.mapRowToAvaliacao(rows[0]) : null;
        } catch (error) {
            console.error(`[Repo Avaliacao] Erro ao buscar avaliação por pessoa e produto:`, error);
            throw new AppError("Erro no banco de dados ao buscar avaliação.", 500);
        }
    }

    async listarPorProdutoId(produto_id: number, page: number, limit: number): Promise<PaginatedRepositoryResponse<Avaliacao>> {
        const offset = (page - 1) * limit;
        const dataQuery = "SELECT * FROM AVALIACAO WHERE produto_id = ? ORDER BY data_criacao DESC LIMIT ? OFFSET ?";
        const countQuery = "SELECT COUNT(avaliacao_id) as total FROM AVALIACAO WHERE produto_id = ?";

        try {
            const [countRows] = await pool.query<RowDataPacket[]>(countQuery, [produto_id]);
            const total = countRows[0].total || 0;
            if (total === 0) return { data: [], total: 0 };

            const [dataRows] = await pool.query<AvaliacaoRow[]>(dataQuery, [produto_id, limit, offset]);
            return {
                data: dataRows.map(this.mapRowToAvaliacao),
                total
            };
        } catch (error) {
            console.error(`[Repo Avaliacao] Erro ao listar avaliações para o produto ${produto_id}:`, error);
            throw new AppError("Erro no banco de dados ao listar avaliações.", 500);
        }
    }

    async calcularEstatisticasPorProduto(produto_id: number): Promise<AvaliacaoStats> {
        const query = "SELECT AVG(nota) as media, COUNT(avaliacao_id) as total FROM AVALIACAO WHERE produto_id = ?";
        try {
            const [rows] = await pool.query<RowDataPacket[]>(query, [produto_id]);
            return {
                media: rows[0].media ? parseFloat(rows[0].media) : 0,
                total: rows[0].total || 0
            };
        } catch (error) {
            console.error(`[Repo Avaliacao] Erro ao calcular estatísticas para o produto ${produto_id}:`, error);
            throw new AppError("Erro no banco de dados ao calcular estatísticas de avaliação.", 500);
        }
    }
}