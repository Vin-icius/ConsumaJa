import { ResultSetHeader, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { Avaliacao } from '../../domain/entities/avaliacao.entity';
// import { AvaliacaoRepository, CreateAvaliacaoRepoData, UpdateAvaliacaoRepoData, FiltrosRelatorioAvaliacao, PaginatedRelatorioResponse } from '../../domain/repositories/avaliacao.repository';
import { AvaliacaoRepository, CreateAvaliacaoRepoData, FiltrosRelatorioAvaliacao, PaginatedRelatorioResponse } from '../../domain/repositories/avaliacao.repository';
import { RelatorioAvaliacao } from '../../domain/entities/relatorio-avaliacao.entity';
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

    async gerarRelatorio(filtros: FiltrosRelatorioAvaliacao): Promise<PaginatedRelatorioResponse> {
        const page = filtros.page || 1;
        const limit = filtros.limit || 15;
        const offset = (page - 1) * limit;

        let baseQuery = `
            FROM NOTA_AVALIACAO na
            JOIN AVALIACAO a ON na.AVALIACAO_avaliacao_id = a.avaliacao_id
            JOIN PERGUNTAS p ON na.PERGUNTAS_perguntas_id = p.perguntas_id
            JOIN PESSOA cl ON a.PESSOA_pessoa_id = cl.pessoa_id
            JOIN VENDA v ON a.VENDA_venda_id = v.venda_id
            LEFT JOIN PROMOCAO promo ON v.PROMOCAO_promocao_id = promo.promocao_id
        `;
        
        const conditions: string[] = [];
        const params: any[] = [];

        if (filtros.clienteId) {
            conditions.push("a.PESSOA_pessoa_id = ?");
            params.push(filtros.clienteId);
        }
        if (filtros.nota) {
            conditions.push("na.avaliacao_nota = ?");
            params.push(filtros.nota);
        }
        if (filtros.dataInicio) {
            conditions.push("a.avaliacao_data >= ?");
            params.push(filtros.dataInicio);
        }
        if (filtros.dataFim) {
            const dataFimAjustada = new Date(filtros.dataFim);
            dataFimAjustada.setHours(23, 59, 59, 999);

            conditions.push("a.avaliacao_data <= ?");
            params.push(dataFimAjustada);
        }
        if (filtros.promocaoId) {
            conditions.push("v.PROMOCAO_promocao_id = ?");
            params.push(filtros.promocaoId);
        }

        if (conditions.length > 0) {
            baseQuery += " WHERE " + conditions.join(" AND ");
        }

        const dataQuery = `
            SELECT 
                a.avaliacao_id,
                a.avaliacao_data,
                cl.pessoa_id,
                cl.pessoa_nome,
                v.venda_id,
                promo.promocao_id,
                promo.promocao_descricao,
                p.perguntas_id as pergunta_id,
                p.perguntas_descricao as pergunta_descricao,
                na.avaliacao_nota as nota
            ${baseQuery}
            ORDER BY a.avaliacao_data DESC
            LIMIT ? OFFSET ?
        `;
        const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;

        try {
            const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
            const total = countRows[0].total || 0;

            if (total === 0) {
                return { data: [], total: 0 };
            }

            const [dataRows] = await pool.query<RowDataPacket[]>(dataQuery, [...params, limit, offset]);
            
            return {
                data: dataRows as RelatorioAvaliacao[],
                total,
            };

        } catch (error) {
            console.error("[Repo Avaliacao] Erro ao gerar relatório:", error);
            throw new AppError("Erro no banco de dados ao gerar relatório de avaliações.", 500);
        }
    }
}