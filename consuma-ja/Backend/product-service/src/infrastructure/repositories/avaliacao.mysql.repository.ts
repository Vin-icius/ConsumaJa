import { ResultSetHeader, PoolConnection } from 'mysql2/promise';
import { Avaliacao } from '../../domain/entities/avaliacao.entity';
import { AvaliacaoRepository, CreateAvaliacaoRepoData } from '../../domain/repositories/avaliacao.repository';
import { pool } from '../database/mysql.connection';
import { AppError } from '../../common/errors/app-error';

export class AvaliacaoMySQLRepository implements AvaliacaoRepository {

    async criar(data: CreateAvaliacaoRepoData): Promise<Avaliacao> {
        const connection: PoolConnection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Inserir o registro principal na tabela AVALIACAO
            const avaliacaoQuery = "INSERT INTO AVALIACAO (VENDA_venda_id, PESSOA_pessoa_id) VALUES (?, ?)";
            const [result] = await connection.query<ResultSetHeader>(avaliacaoQuery, [data.VENDA_venda_id, data.PESSOA_pessoa_id]);
            const avaliacaoId = result.insertId;

            if (!avaliacaoId) {
                throw new Error("Falha ao criar o registro principal da avaliação.");
            }

            // 2. Inserir cada resposta na tabela NOTA_AVALIACAO
            const notasQuery = "INSERT INTO NOTA_AVALIACAO (AVALIACAO_avaliacao_id, PERGUNTAS_perguntas_id, avaliacao_nota) VALUES ?";
            const notasValues = data.respostas.map(r => [avaliacaoId, r.pergunta_id, r.nota]);
            
            await connection.query(notasQuery, [notasValues]);

            await connection.commit();

            // Retorna um objeto simplificado, já que a busca seria complexa
            return {
                avaliacao_id: avaliacaoId,
                VENDA_venda_id: data.VENDA_venda_id,
                PESSOA_pessoa_id: data.PESSOA_pessoa_id,
                avaliacao_data: new Date()
            };

        } catch (error: any) {
            await connection.rollback();
            console.error("[Repo Avaliacao] Erro ao criar avaliação com transação:", error);
            // Verifica se a venda já foi avaliada
            if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code?.includes('FOREIGN KEY')) {
                 throw new AppError("Venda ou usuário não encontrado.", 404);
            }
            throw new AppError("Erro no banco de dados ao salvar avaliação.", 500);
        } finally {
            connection.release();
        }
    }
}