import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Pergunta } from '../../domain/entities/pergunta.entity';
import { PerguntaRepository } from '../../domain/repositories/pergunta.repository';
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

    async obterOuCriarPerguntaPadrao(descricao: string): Promise<Pergunta> {
        try {
            const selectQuery = "SELECT * FROM PERGUNTAS WHERE perguntas_descricao = ? LIMIT 1";
            const [rows] = await pool.query<PerguntaRow[]>(selectQuery, [descricao]);
            if (rows.length > 0) {
                const pergunta = rows[0];
                if (!pergunta.ativo) {
                    await pool.query("UPDATE PERGUNTAS SET ativo = TRUE WHERE perguntas_id = ?", [pergunta.perguntas_id]);
                    pergunta.ativo = true;
                }
                return pergunta;
            }

            const insertQuery = "INSERT INTO PERGUNTAS (perguntas_descricao, ativo) VALUES (?, TRUE)";
            const [result] = await pool.query<ResultSetHeader>(insertQuery, [descricao]);

            return {
                perguntas_id: result.insertId,
                perguntas_descricao: descricao,
                ativo: true,
            };
        } catch (error) {
            console.error("[Repo Pergunta] Erro ao garantir pergunta padrão:", error);
            throw new AppError("Erro ao garantir pergunta padrão de avaliação.", 500);
        }
    }
}