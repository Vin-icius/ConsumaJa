import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Pergunta } from '../../domain/entities/pergunta.entity';
import { PerguntaRepository, CreatePerguntaData, UpdatePerguntaData } from '../../domain/repositories/pergunta.repository';
import { pool } from '../database/mysql.connection';
import { AppError } from '../../common/errors/app-error';

interface PerguntaRow extends Pergunta, RowDataPacket {}

export class PerguntaMySQLRepository implements PerguntaRepository {
    async listarAtivas(): Promise<Pergunta[]> {
        const query = "SELECT * FROM PERGUNTAS WHERE ativo = TRUE ORDER BY perguntas_id ASC";
        try {
            const [rows] = await pool.query<PerguntaRow[]>(query);
            return rows;
        } catch (error) {
            console.error("[Repo Pergunta] Erro ao listar perguntas ativas:", error);
            throw new AppError("Erro no banco de dados ao buscar perguntas.", 500);
        }
    }

    async listarTodas(): Promise<Pergunta[]> {
        const query = "SELECT * FROM PERGUNTAS ORDER BY perguntas_id ASC";
        try {
            const [rows] = await pool.query<PerguntaRow[]>(query);
            return rows;
        } catch (error) {
            console.error("[Repo Pergunta] Erro ao listar todas as perguntas:", error);
            throw new AppError("Erro no banco de dados ao buscar perguntas.", 500);
        }
    }

    async buscarPorId(id: number): Promise<Pergunta | null> {
        const query = "SELECT * FROM PERGUNTAS WHERE perguntas_id = ?";
        try {
            const [rows] = await pool.query<PerguntaRow[]>(query, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`[Repo Pergunta] Erro ao buscar pergunta por ID ${id}:`, error);
            throw new AppError("Erro no banco de dados ao buscar pergunta.", 500);
        }
    }

    async criar(data: CreatePerguntaData): Promise<Pergunta> {
        const query = "INSERT INTO PERGUNTAS (perguntas_descricao, ativo) VALUES (?, ?)";
        try {
            const [result] = await pool.query<ResultSetHeader>(query, [data.perguntas_descricao, data.ativo]);
            const insertedId = result.insertId;
            const novaPergunta = await this.buscarPorId(insertedId);
            if (!novaPergunta) {
                throw new AppError("Falha ao criar ou buscar pergunta após inserção.", 500);
            }
            return novaPergunta;
        } catch (error) {
            console.error("[Repo Pergunta] Erro ao criar pergunta:", error);
            throw new AppError("Erro no banco de dados ao criar pergunta.", 500);
        }
    }

    async atualizar(id: number, data: UpdatePerguntaData): Promise<Pergunta | null> {
        const fields = Object.keys(data);
        if (fields.length === 0) {
            return this.buscarPorId(id);
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(data), id];

        const query = `UPDATE PERGUNTAS SET ${setClause} WHERE perguntas_id = ?`;
        try {
            const [result] = await pool.query<ResultSetHeader>(query, values);
            if (result.affectedRows === 0) return null;
            return this.buscarPorId(id);
        } catch (error) {
            console.error(`[Repo Pergunta] Erro ao atualizar pergunta ${id}:`, error);
            throw new AppError("Erro no banco de dados ao atualizar pergunta.", 500);
        }
    }

    async excluir(id: number): Promise<boolean> {
        const query = "UPDATE PERGUNTAS SET ativo = FALSE WHERE perguntas_id = ?";
        try {
            const [result] = await pool.query<ResultSetHeader>(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`[Repo Pergunta] Erro ao excluir (desativar) pergunta ${id}:`, error);
            throw new AppError("Erro no banco de dados ao desativar pergunta.", 500);
        }
    }
}