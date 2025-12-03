import { ResultSetHeader, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { Avaliacao } from '../../domain/entities/avaliacao.entity';
import {
    AvaliacaoRepository,
    CreateAvaliacaoRepoData,
    ListarAvaliacoesFilters,
    ListarAvaliacoesResult,
    AvaliacaoResumoItem,
} from '../../domain/repositories/avaliacao.repository';
import { pool } from '../database/mysql.connection';
import { AppError } from '../../common/errors/app-error';

interface AvaliacaoResumoRow extends RowDataPacket {
    avaliacao_id: number;
    venda_id: number;
    avaliacao_data: Date;
    avaliacao_descricao: string | null;
    cliente_id: number;
    cliente_nome: string;
    cliente_email: string;
    fornecedor_id: number | null;
    fornecedor_nome: string | null;
    promocao_id: number | null;
    promocao_descricao: string | null;
    nota_media: number | null;
    total_notas: number;
    itens_json: string | null;
}

const safeJsonParse = <T>(value: string | null): T | null => {
    if (!value) {
        return null;
    }
    try {
        return JSON.parse(value) as T;
    } catch (error) {
        console.warn('[Repo Avaliacao] Falha ao converter JSON de produtos', error);
        return null;
    }
};

export class AvaliacaoMySQLRepository implements AvaliacaoRepository {

    async criar(data: CreateAvaliacaoRepoData): Promise<Avaliacao> {
        const connection: PoolConnection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Inserir o registro principal na tabela AVALIACAO
            const avaliacaoQuery = "INSERT INTO AVALIACAO (VENDA_venda_id, PESSOA_pessoa_id, avaliacao_descricao) VALUES (?, ?, ?)";
            const [result] = await connection.query<ResultSetHeader>(avaliacaoQuery, [
                data.VENDA_venda_id,
                data.PESSOA_pessoa_id,
                data.descricao ?? null,
            ]);
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
                avaliacao_data: new Date(),
                avaliacao_descricao: data.descricao ?? undefined,
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

    async listar(filters: ListarAvaliacoesFilters): Promise<ListarAvaliacoesResult> {
        const page = Math.max(1, filters.page || 1);
        const limit = Math.min(Math.max(filters.limit || 10, 5), 100);
        const offset = (page - 1) * limit;

        const whereClauses: string[] = [];
        const havingClauses: string[] = [];
        const params: any[] = [];
        const havingParams: any[] = [];

        if (filters.fornecedorId) {
            whereClauses.push('COALESCE(v.fornecedor_pessoa_id, pr.JURIDICA_PESSOA_pessoa_id) = ?');
            params.push(filters.fornecedorId);
        }

        if (filters.clienteId) {
            whereClauses.push('cli.pessoa_id = ?');
            params.push(filters.clienteId);
        }

        if (filters.fornecedorNome) {
            whereClauses.push('forn.pessoa_nome LIKE ?');
            params.push(`%${filters.fornecedorNome}%`);
        }

        if (filters.clienteNome) {
            whereClauses.push('cli.pessoa_nome LIKE ?');
            params.push(`%${filters.clienteNome}%`);
        }

        if (filters.startDate) {
            whereClauses.push('DATE(a.avaliacao_data) >= ?');
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            whereClauses.push('DATE(a.avaliacao_data) <= ?');
            params.push(filters.endDate);
        }

        if (filters.search) {
            const like = `%${filters.search}%`;
            whereClauses.push(
                "(cli.pessoa_nome LIKE ? OR forn.pessoa_nome LIKE ? OR pr.promocao_descricao LIKE ? OR COALESCE(itens.itens_text, '') LIKE ?)",
            );
            params.push(like, like, like, like);
        }

        if (filters.notaMin !== undefined) {
            havingClauses.push('AVG(na.avaliacao_nota) >= ?');
            havingParams.push(filters.notaMin);
        }

        if (filters.notaMax !== undefined) {
            havingClauses.push('AVG(na.avaliacao_nota) <= ?');
            havingParams.push(filters.notaMax);
        }

        const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const havingSql = havingClauses.length ? `HAVING ${havingClauses.join(' AND ')}` : '';

        const baseJoin = `FROM AVALIACAO a
            JOIN VENDA v ON v.venda_id = a.VENDA_venda_id
            JOIN PESSOA cli ON cli.pessoa_id = a.PESSOA_pessoa_id
            LEFT JOIN PROMOCAO pr ON pr.promocao_id = v.PROMOCAO_promocao_id
            LEFT JOIN PESSOA forn ON forn.pessoa_id = COALESCE(v.fornecedor_pessoa_id, pr.JURIDICA_PESSOA_pessoa_id)
            LEFT JOIN NOTA_AVALIACAO na ON na.AVALIACAO_avaliacao_id = a.avaliacao_id
            LEFT JOIN (
                SELECT
                    iv.VENDA_venda_id AS venda_id,
                    JSON_ARRAYAGG(JSON_OBJECT('nome', p.produto_nome, 'quantidade', iv.itemVenda_qtde)) AS itens_json,
                    GROUP_CONCAT(DISTINCT p.produto_nome ORDER BY p.produto_nome SEPARATOR ', ') AS itens_text
                FROM ITEM_VENDA iv
                JOIN LOTEPROD lp ON lp.lote_id = iv.LOTEPROD_lote_id
                JOIN PRODUTO p ON p.produto_id = lp.produto_id
                GROUP BY iv.VENDA_venda_id
            ) itens ON itens.venda_id = v.venda_id`;

        const dataGroupByColumns = `
            a.avaliacao_id,
            a.avaliacao_data,
            a.avaliacao_descricao,
            v.venda_id,
            cli.pessoa_id,
            cli.pessoa_nome,
            cli.pessoa_email,
            forn.pessoa_id,
            forn.pessoa_nome,
            pr.promocao_id,
            pr.promocao_descricao,
            itens.itens_json
        `;

        const countQuery = `
            WITH avaliacao_resumo AS (
                SELECT a.avaliacao_id
                ${baseJoin}
                ${whereSql}
                GROUP BY ${dataGroupByColumns}
                ${havingSql}
            )
            SELECT COUNT(*) AS total FROM avaliacao_resumo;
        `;

        const [countRows] = await pool.query<RowDataPacket[]>(countQuery, [...params, ...havingParams]);
        const total = Number(countRows[0]?.total ?? 0);

        if (total === 0) {
            return { data: [], page, limit, total: 0, totalPages: 0 };
        }

        const dataQuery = `
            WITH avaliacao_resumo AS (
                SELECT
                    a.avaliacao_id,
                    a.avaliacao_data,
                    a.avaliacao_descricao,
                    v.venda_id,
                    cli.pessoa_id AS cliente_id,
                    cli.pessoa_nome AS cliente_nome,
                    cli.pessoa_email AS cliente_email,
                    forn.pessoa_id AS fornecedor_id,
                    forn.pessoa_nome AS fornecedor_nome,
                    pr.promocao_id,
                    pr.promocao_descricao,
                    AVG(na.avaliacao_nota) AS nota_media,
                    COUNT(na.avaliacao_nota) AS total_notas,
                    itens.itens_json
                ${baseJoin}
                ${whereSql}
                GROUP BY ${dataGroupByColumns}
                ${havingSql}
            )
            SELECT * FROM avaliacao_resumo
            ORDER BY avaliacao_data DESC
            LIMIT ? OFFSET ?;
        `;

        const [rows] = await pool.query<AvaliacaoResumoRow[]>(dataQuery, [...params, ...havingParams, limit, offset]);

        const items: AvaliacaoResumoItem[] = rows.map((row) => {
            const produtos = safeJsonParse<Array<{ nome: string; quantidade: number }>>(row.itens_json) ?? [];
            return {
                avaliacao_id: row.avaliacao_id,
                venda_id: row.venda_id,
                avaliacao_data: row.avaliacao_data,
                avaliacao_descricao: row.avaliacao_descricao,
                nota_media: row.nota_media,
                total_notas: row.total_notas,
                cliente: {
                    id: row.cliente_id,
                    nome: row.cliente_nome,
                    email: row.cliente_email,
                },
                fornecedor: row.fornecedor_id
                    ? {
                          id: row.fornecedor_id,
                          nome: row.fornecedor_nome,
                      }
                    : null,
                promocao: {
                    id: row.promocao_id,
                    descricao: row.promocao_descricao,
                },
                produtos,
            };
        });

        return {
            data: items,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
}