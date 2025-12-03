import { LoteProd } from "../../domain/entities/loteprod.entity";
import { LoteProdRepository, ListarLotesDisponiveisFiltros,
    CreateLoteProdRepoData,
    UpdateLoteProdRepoData,
    PaginatedRepositoryResponse
 } from "../../domain/repositories/loteprod.repository";
import { ListarLotesQueryDto } from "../../interfaces/dtos/listar-lotes-query.dto";
import { pool } from "../database/mysql.connection";
import { AppError } from "../../common/errors/app-error";
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface LoteProdRow extends LoteProd, RowDataPacket { produto_nome?: string; }

export class LoteProdMySQLRepository implements LoteProdRepository {

    private mapRowToLoteProd(row: LoteProdRow): LoteProd {
        return {
            lote_id: row.lote_id,
            produto_id: row.produto_id,
            lote_codigo: row.lote_codigo,
            lote_validade: new Date(row.lote_validade),
            lote_quantidade_inicial: row.lote_quantidade_inicial,
            lote_quantidade_atual: row.lote_quantidade_atual,
            data_entrada: new Date(row.data_entrada),
            ativo: row.ativo !== undefined ? Boolean(row.ativo) : true,
            produto_nome: row.produto_nome, // Para o picker
            fornecedor_pessoa_id: row.fornecedor_pessoa_id,
            fornecedor_nome: row.fornecedor_nome ?? null,
        };
    }

    async buscarPorId(lote_id: number, apenasAtivo = true): Promise<LoteProd | null> {
        // Query para buscar lote e nome do produto associado
        let query = `
            SELECT lp.*, p.produto_nome, forn.pessoa_nome AS fornecedor_nome
            FROM LOTEPROD lp
            JOIN PRODUTO p ON lp.produto_id = p.produto_id
            LEFT JOIN PESSOA forn ON forn.pessoa_id = lp.fornecedor_pessoa_id
            WHERE lp.lote_id = ?
        `;
        const params: any[] = [lote_id];

        if (apenasAtivo) {
            query += " AND lp.ativo = TRUE AND p.ativo = TRUE";
        }

        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await pool.query<LoteProdRow[]>(query, params);
            return rows.length > 0 ? this.mapRowToLoteProd(rows[0]) : null;
        } catch (error: any) {
            console.error(`[Repo LoteProd] Erro ao buscar lote por ID ${lote_id}:`, error);
            throw new AppError("Erro no banco de dados ao buscar lote.", 500, false);
        }
    }

    async listarDisponiveis(filtros: ListarLotesDisponiveisFiltros): Promise<LoteProd[]> {
        let query = `
            SELECT lp.*, p.produto_nome, forn.pessoa_nome AS fornecedor_nome
            FROM LOTEPROD lp
            JOIN PRODUTO p ON lp.produto_id = p.produto_id
            LEFT JOIN PESSOA forn ON forn.pessoa_id = lp.fornecedor_pessoa_id
        `;
        const conditions: string[] = [];
        const params: any[] = [];

        // Condições padrão
        if (filtros.apenasComEstoque !== false) { conditions.push("lp.lote_quantidade_atual > 0"); }
        if (filtros.apenasNaoVencidos !== false) { conditions.push("lp.lote_validade >= CURDATE()"); }
        conditions.push("lp.ativo = TRUE");
        conditions.push("p.ativo = TRUE");
        conditions.push("p.produto_status = 'APROVADO'");


        // <<< FILTRO ESSENCIAL POR ID DO PRODUTO >>>
        if (filtros.produtoId) {
            conditions.push("lp.produto_id = ?");
            params.push(filtros.produtoId);
        } else if (filtros.produtoNomeQuery) {
            // Se produtoId não for fornecido, mas nome sim (menos provável para este caso de uso, mas possível)
            conditions.push("p.produto_nome LIKE ?");
            params.push(`%${filtros.produtoNomeQuery}%`);
        }
        // -----------------------------------------

        if (filtros.fornecedorId) {
            conditions.push("lp.fornecedor_pessoa_id = ?");
            params.push(filtros.fornecedorId);
        }


        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }
        query += " ORDER BY lp.lote_validade ASC, p.produto_nome ASC"; // Lotes mais próximos do vencimento primeiro

        // Paginação pode ser adicionada aqui se a lista de lotes para um produto for muito grande
        // const page = filtros.page || 1;
        // const limit = filtros.limit || 20; // Exemplo
        // const offset = (page - 1) * limit;
        // query += " LIMIT ? OFFSET ?";
        // params.push(limit, offset);

        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            console.log("[Repo LoteProd] Query listarDisponiveis:", query.replace(/\s+/g, ' ').trim());
            console.log("[Repo LoteProd] Params listarDisponiveis:", params);
            const [rows] = await pool.query<LoteProdRow[]>(query, params);
            return rows.map(this.mapRowToLoteProd);
        } catch (error: any) {
            console.error("[Repo LoteProd] Erro ao listar lotes disponíveis:", error);
            throw new AppError("Erro DB ao listar lotes disponíveis.", 500, false);
        }
    }

    async decrementarEstoque(lote_id: number, quantidade: number): Promise<boolean> {
        // Esta query assume que a validação de quantidade suficiente já foi feita no serviço
        const query = "UPDATE LOTEPROD SET lote_quantidade_atual = lote_quantidade_atual - ? WHERE lote_id = ? AND lote_quantidade_atual >= ?";
        try {
            if (!pool) throw new AppError("Pool...", 500, false);
            // <<< Usa ResultSetHeader importado >>>
            const [result] = await pool.query<ResultSetHeader>(query, [quantidade, lote_id, quantidade]);
            return result.affectedRows > 0;
        } catch (error: any) {
             console.error(`[Repo LoteProd] Erro ao decrementar estoque do lote ${lote_id}:`, error);
             throw new AppError("Erro DB ao decrementar estoque do lote.", 500, false);
        }
    }

    async findByCodigoAndProdutoId(lote_codigo: string, produto_id: number): Promise<LoteProd | null> {
        const query = "SELECT * FROM LOTEPROD WHERE lote_codigo = ? AND produto_id = ? LIMIT 1";
        try {
            if (!pool) throw new AppError("Pool...", 500, false);
            const [rows] = await pool.query<LoteProdRow[]>(query, [lote_codigo, produto_id]);
            return rows.length > 0 ? this.mapRowToLoteProd(rows[0]) : null;
        } catch (error: any) {
            console.error(`[Repo LoteProd] Erro ao buscar lote por código ${lote_codigo} e produto ${produto_id}:`, error);
            throw new AppError("Erro DB ao buscar lote por código e produto.", 500, false);
        }
    }

    async criar(data: CreateLoteProdRepoData): Promise<LoteProd> {
        const { produto_id, fornecedor_pessoa_id, lote_codigo, lote_validade, lote_quantidade_inicial, lote_quantidade_atual, data_entrada, ativo } = data;
        const query = `
            INSERT INTO LOTEPROD (produto_id, fornecedor_pessoa_id, lote_codigo, lote_validade, lote_quantidade_inicial, lote_quantidade_atual, data_entrada, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        try {
            if (!pool) throw new AppError("Pool...", 500, false);
            const [result] = await pool.query<ResultSetHeader>(query, [
                produto_id, fornecedor_pessoa_id, lote_codigo, lote_validade, lote_quantidade_inicial, lote_quantidade_atual, data_entrada, ativo
            ]);
            const insertedId = result.insertId;
            const novoLote = await this.buscarPorId(insertedId, false); // Busca qualquer status para confirmar
            if (!novoLote) throw new AppError("Falha ao criar ou buscar lote após inserção.", 500);
            return novoLote;
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') { // Checa constraint idx_lote_unico_produto
                throw new AppError(`Lote com código "${lote_codigo}" já existe para este produto.`, 409);
            }
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new AppError(`Produto com ID ${produto_id} não encontrado.`, 400);
            }
            console.error("[Repo LoteProd] Erro ao criar lote:", error);
            throw new AppError("Erro no banco de dados ao criar lote.", 500, false);
        }
    }

    async listar(filtros: ListarLotesQueryDto): Promise<PaginatedRepositoryResponse<LoteProd>> {
        let dataQuery = `SELECT lp.*, p.produto_nome, forn.pessoa_nome AS fornecedor_nome FROM LOTEPROD lp JOIN PRODUTO p ON lp.produto_id = p.produto_id LEFT JOIN PESSOA forn ON forn.pessoa_id = lp.fornecedor_pessoa_id`;
        let countQuery = `SELECT COUNT(lp.lote_id) as total FROM LOTEPROD lp JOIN PRODUTO p ON lp.produto_id = p.produto_id LEFT JOIN PESSOA forn ON forn.pessoa_id = lp.fornecedor_pessoa_id`;
        const conditions: string[] = [];
        const paramsSql: any[] = [];

        if (filtros.produtoId) { conditions.push("lp.produto_id = ?"); paramsSql.push(filtros.produtoId); }
        if (filtros.loteCodigoQuery) { conditions.push("lp.lote_codigo LIKE ?"); paramsSql.push(`%${filtros.loteCodigoQuery}%`); }
        if (filtros.validadeApos) { conditions.push("lp.lote_validade >= ?"); paramsSql.push(filtros.validadeApos); }
        if (filtros.validadeAntes) { conditions.push("lp.lote_validade <= ?"); paramsSql.push(filtros.validadeAntes); }
        if (filtros.apenasComEstoque === 'true') { conditions.push("lp.lote_quantidade_atual > 0"); }
        if (filtros.ativo !== undefined) { conditions.push("lp.ativo = ?"); paramsSql.push(filtros.ativo === 'true'); }
        if (filtros.fornecedorId) { conditions.push("lp.fornecedor_pessoa_id = ?"); paramsSql.push(filtros.fornecedorId); }

        if (conditions.length > 0) {
            const whereClause = " WHERE " + conditions.join(" AND ");
            dataQuery += whereClause; countQuery += whereClause;
        }
        dataQuery += " ORDER BY lp.lote_validade ASC, p.produto_nome ASC";
        const page = filtros.page || 1; const limit = filtros.limit || 10; const offset = (page - 1) * limit;
        dataQuery += " LIMIT ? OFFSET ?";
        const dataParamsFinal = [...paramsSql, limit, offset];

        try {
            if (!pool) throw new AppError("Pool...", 500, false);
            const [countRows] = await pool.query<RowDataPacket[]>(countQuery, paramsSql);
            const total = countRows[0]?.total || 0;
            if (total === 0) return { data: [], total: 0 };
            const [dataRows] = await pool.query<LoteProdRow[]>(dataQuery, dataParamsFinal);
            return { data: dataRows.map(this.mapRowToLoteProd), total };
        } catch (error: any) { /* ... */ throw new AppError("Erro DB...", 500, false); }
    }

    async atualizar(lote_id: number, data: UpdateLoteProdRepoData): Promise<LoteProd | null> {
        const fields = Object.keys(data).filter(key => (data as any)[key] !== undefined);
        if (fields.length === 0) return this.buscarPorId(lote_id, false);

        const dataToUpdate: any = {}; // Para não modificar o 'data' original
        if (data.lote_validade !== undefined) dataToUpdate.lote_validade = data.lote_validade; // Já é Date
        if (data.lote_quantidade_inicial !== undefined) dataToUpdate.lote_quantidade_inicial = data.lote_quantidade_inicial;
        if (data.lote_quantidade_atual !== undefined) dataToUpdate.lote_quantidade_atual = data.lote_quantidade_atual;
        if (data.ativo !== undefined) dataToUpdate.ativo = data.ativo;

        const setClause = Object.keys(dataToUpdate).map(field => `${field} = ?`).join(', ');
        if (!setClause) return this.buscarPorId(lote_id, false); // Nada para atualizar
        const values = Object.values(dataToUpdate);
        values.push(lote_id);

        const query = `UPDATE LOTEPROD SET ${setClause} WHERE lote_id = ?`;
        try {
            if (!pool) throw new AppError("Pool...", 500, false);
            const [result] = await pool.query<ResultSetHeader>(query, values);
            if (result.affectedRows === 0) return null;
            return this.buscarPorId(lote_id, false);
        } catch (error: any) { /* ... */ throw new AppError("Erro DB...", 500, false); }
    }

    async excluir(lote_id: number): Promise<boolean> { // Exclusão Lógica
        const query = "UPDATE LOTEPROD SET ativo = FALSE WHERE lote_id = ? AND ativo = TRUE";
        try {
            if (!pool) throw new AppError("Pool...", 500, false);
            const [result] = await pool.query<ResultSetHeader>(query, [lote_id]);
            return result.affectedRows > 0;
        } catch (error: any) { /* ... */ throw new AppError("Erro DB...", 500, false); }
    }
}