import { RowDataPacket } from 'mysql2/promise';
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
}