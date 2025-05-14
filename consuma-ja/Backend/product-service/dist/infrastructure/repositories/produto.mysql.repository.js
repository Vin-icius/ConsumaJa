"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoMySQLRepository = void 0;
const mysql_connection_1 = require("../database/mysql.connection");
const app_error_1 = require("../../common/errors/app-error");
class ProdutoMySQLRepository {
    constructor() {
        this.BASE_SELECT_QUERY = `
        SELECT
            p.*, p.ativo as produto_ativo,
            c.categoria_nome, c.ativo as categoria_ativo,
            m.marca_nome, m.ativo as marca_ativo,
            t.tipo_nome, t.ativo as tipo_ativo
        FROM PRODUTO p
        LEFT JOIN CATEGORIA_PRODUTO c ON p.CATEGORIA_PRODUTO_categoria_id = c.categoria_id
        LEFT JOIN MARCA_PRODUTO m ON p.MARCA_PRODUTO_marca_id = m.marca_id
        LEFT JOIN TIPO_PRODUTO t ON p.TIPO_PRODUTO_tipo_id = t.tipo_id
    `;
    }
    // Helper para mapear linha completa para entidade Produto
    mapRowToProduto(row) {
        // Cria objetos relacionados SOMENTE se existirem e estiverem ATIVOS
        const categoria = row.CATEGORIA_PRODUTO_categoria_id && row.categoria_ativo ? {
            categoria_id: row.CATEGORIA_PRODUTO_categoria_id,
            categoria_nome: row.categoria_nome, // Usa '!' pois JOIN garante que não será null se ativo=true
            ativo: true,
        } : null;
        const marca = row.MARCA_PRODUTO_marca_id && row.marca_ativo ? {
            marca_id: row.MARCA_PRODUTO_marca_id,
            marca_nome: row.marca_nome,
            ativo: true,
        } : null;
        const tipo = row.TIPO_PRODUTO_tipo_id && row.tipo_ativo ? {
            tipo_id: row.TIPO_PRODUTO_tipo_id,
            tipo_nome: row.tipo_nome,
            ativo: true,
        } : null;
        // Cria objeto Produto (usando 'as Produto' para garantir tipo)
        const produto = {
            produto_id: row.produto_id,
            produto_nome: row.produto_nome,
            produto_status: row.produto_status,
            produto_medida: row.produto_medida,
            produto_precoOriginal: Number(row.produto_precoOriginal),
            motivo: row.motivo,
            descricao: row.descricao,
            data_registro: new Date(row.data_registro),
            data_aprovacao: row.data_aprovacao ? new Date(row.data_aprovacao) : null,
            data_exclusao: row.data_exclusao ? new Date(row.data_exclusao) : null,
            ativo: Boolean(row.produto_ativo),
            CATEGORIA_PRODUTO_categoria_id: row.CATEGORIA_PRODUTO_categoria_id,
            MARCA_PRODUTO_marca_id: row.MARCA_PRODUTO_marca_id,
            TIPO_PRODUTO_tipo_id: row.TIPO_PRODUTO_tipo_id,
            categoria: categoria,
            marca: marca,
            tipo: tipo,
        };
        return produto;
    }
    // Método para buscar por nome
    async findByNome(nome) {
        // Busca produto ativo com esse nome
        const query = this.BASE_SELECT_QUERY + " WHERE p.produto_nome = ? AND p.ativo = TRUE LIMIT 1";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [nome]);
            return rows.length > 0 ? this.mapRowToProduto(rows[0]) : null;
        }
        catch (error) {
            console.error("[Repo] Erro ao buscar produto por nome:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao buscar produto por nome.", 500, false);
        }
    }
    async listarParaSelecaoPromocao(filtros) {
        var _a;
        console.log("[Repo Produto] Listando produtos para seleção com filtros (paginado):", filtros);
        const baseQuery = `
            FROM PRODUTO p
            LEFT JOIN CATEGORIA_PRODUTO cat ON p.CATEGORIA_PRODUTO_categoria_id = cat.categoria_id
            LEFT JOIN MARCA_PRODUTO mar ON p.MARCA_PRODUTO_marca_id = mar.marca_id
            LEFT JOIN TIPO_PRODUTO tip ON p.TIPO_PRODUTO_tipo_id = tip.tipo_id
        `;
        const conditions = ["p.ativo = TRUE", "p.produto_status = 'APROVADO'"];
        const params = [];
        if (filtros.nomeQuery && filtros.nomeQuery.trim() !== "") {
            conditions.push("p.produto_nome LIKE ?");
            params.push(`%${filtros.nomeQuery.trim()}%`);
        }
        if (filtros.categoriaId) {
            conditions.push("p.CATEGORIA_PRODUTO_categoria_id = ?");
            params.push(filtros.categoriaId);
        }
        if (filtros.marcaId) {
            conditions.push("p.MARCA_PRODUTO_marca_id = ?");
            params.push(filtros.marcaId);
        }
        if (filtros.tipoId) {
            conditions.push("p.TIPO_PRODUTO_tipo_id = ?");
            params.push(filtros.tipoId);
        }
        // Filtro fornecedorId omitido conforme discussão anterior
        const whereClause = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";
        // 1. Query para Contar o Total de Itens (sem LIMIT/OFFSET)
        const countQuery = `SELECT COUNT(DISTINCT p.produto_id) as total ${baseQuery} ${whereClause}`;
        // 2. Query para buscar os dados da página atual
        let dataQuery = `SELECT DISTINCT p.produto_id, p.produto_nome, p.produto_imagem_url ${baseQuery} ${whereClause}`;
        dataQuery += " ORDER BY p.produto_nome ASC";
        const page = Number(filtros.page) || 1;
        const limit = Number(filtros.limit) || 10;
        const offset = (page - 1) * limit;
        dataQuery += " LIMIT ? OFFSET ?";
        const dataParams = [...params, limit, offset];
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            console.log("[Repo Produto] Count Query:", countQuery.replace(/\s+/g, ' ').trim());
            console.log("[Repo Produto] Count Params:", params);
            const [countRows] = await mysql_connection_1.pool.query(countQuery, params);
            const total = ((_a = countRows[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            console.log("[Repo Produto] Data Query:", dataQuery.replace(/\s+/g, ' ').trim());
            console.log("[Repo Produto] Data Params:", dataParams);
            const [dataRows] = await mysql_connection_1.pool.query(dataQuery, dataParams);
            const data = dataRows.map((row) => ({
                produto_id: row.produto_id,
                produto_nome: row.produto_nome,
                produto_imagem_url: row.produto_imagem_url,
            }));
            return { data, total };
        }
        catch (error) {
            console.error("[Repo Produto] Erro em listarParaSelecaoPromocao:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao buscar produtos para seleção.", 500, false);
        }
    }
    async criar(data) {
        const { produto_nome, produto_medida, produto_precoOriginal, descricao, CATEGORIA_PRODUTO_categoria_id, MARCA_PRODUTO_marca_id, TIPO_PRODUTO_tipo_id } = data;
        const query = `
            INSERT INTO PRODUTO (
                produto_nome, produto_status, produto_medida, produto_precoOriginal,
                descricao, data_registro, ativo,
                CATEGORIA_PRODUTO_categoria_id, MARCA_PRODUTO_marca_id, TIPO_PRODUTO_tipo_id
            ) VALUES (?, 'PENDENTE', ?, ?, ?, NOW(), TRUE, ?, ?, ?)
        `;
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [
                produto_nome, produto_medida, produto_precoOriginal, descricao,
                CATEGORIA_PRODUTO_categoria_id, MARCA_PRODUTO_marca_id, TIPO_PRODUTO_tipo_id
            ]);
            const insertedId = result.insertId;
            const novoProduto = await this.buscarPorId(insertedId, true);
            if (!novoProduto)
                throw new app_error_1.AppError("Falha ao buscar produto após criação.", 500, false);
            return novoProduto;
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new app_error_1.AppError(`Produto "${produto_nome}" já existe (constraint UNIQUE violada).`, 409);
            }
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new app_error_1.AppError("Erro de referência: Categoria, Marca ou Tipo inválido(a) ou inativo(a).", 400);
            }
            console.error("[Repo] Erro ao criar produto:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao criar produto.", 500, false);
        }
    }
    async listar(filtros) {
        var _a;
        console.log("[Repo Produto] Listando produtos (geral) com filtros:", filtros);
        let baseFromClause = `
            FROM PRODUTO p
            LEFT JOIN CATEGORIA_PRODUTO cat ON p.CATEGORIA_PRODUTO_categoria_id = cat.categoria_id
            LEFT JOIN MARCA_PRODUTO mar ON p.MARCA_PRODUTO_marca_id = mar.marca_id
            LEFT JOIN TIPO_PRODUTO tip ON p.TIPO_PRODUTO_tipo_id = tip.tipo_id
        `;
        let countSelectQuery = `SELECT COUNT(DISTINCT p.produto_id) as total ${baseFromClause}`;
        let dataSelectQuery = `SELECT DISTINCT p.*, cat.categoria_nome, mar.marca_nome, tip.tipo_nome ${baseFromClause}`;
        const conditions = [];
        const params = [];
        if (filtros.produto_id) {
            conditions.push("p.produto_id = ?");
            params.push(filtros.produto_id);
        }
        if (filtros.nomeQuery && filtros.nomeQuery.trim() !== "") {
            conditions.push("p.produto_nome LIKE ?");
            params.push(`%${filtros.nomeQuery.trim()}%`);
        }
        if (filtros.categoriaId) {
            conditions.push("p.CATEGORIA_PRODUTO_categoria_id = ?");
            params.push(filtros.categoriaId);
        }
        if (filtros.marcaId) {
            conditions.push("p.MARCA_PRODUTO_marca_id = ?");
            params.push(filtros.marcaId);
        }
        if (filtros.tipoId) {
            conditions.push("p.TIPO_PRODUTO_tipo_id = ?");
            params.push(filtros.tipoId);
        }
        if (filtros.produto_status) {
            conditions.push("p.produto_status = ?");
            params.push(filtros.produto_status);
        }
        // Tratamento do filtro 'ativo' (string "true" ou "false")
        if (filtros.ativo !== undefined) {
            conditions.push("p.ativo = ?");
            params.push(filtros.ativo === 'true'); // Converte string para boolean
        }
        else {
            // Comportamento padrão se 'ativo' não for especificado: listar apenas ativos
            conditions.push("p.ativo = TRUE");
        }
        const whereClause = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";
        countSelectQuery += whereClause;
        dataSelectQuery += whereClause;
        dataSelectQuery += " ORDER BY p.produto_nome ASC";
        const page = parseInt(String(filtros.page), 10) || 1;
        const limit = parseInt(String(filtros.limit), 10) || 10;
        const offset = (page - 1) * limit;
        dataSelectQuery += " LIMIT ? OFFSET ?";
        const dataParamsQuery = [...params, limit, offset]; // Parâmetros para a query de dados
        const countParamsQuery = [...params]; // Parâmetros para a query de contagem (sem limit/offset)
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            console.log("[Repo Produto] Listar - Count Query:", countSelectQuery.replace(/\s+/g, ' ').trim(), countParamsQuery);
            const [countRows] = await mysql_connection_1.pool.query(countSelectQuery, countParamsQuery);
            const total = ((_a = countRows[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            console.log("[Repo Produto] Listar - Data Query:", dataSelectQuery.replace(/\s+/g, ' ').trim(), dataParamsQuery);
            const [dataRows] = await mysql_connection_1.pool.query(dataSelectQuery, dataParamsQuery);
            const data = dataRows.map(row => {
                const produto = this.mapRowToProduto(row);
                // delete produto.pessoa_senha; // Produto não tem pessoa_senha
                return produto;
            });
            return { data, total };
        }
        catch (error) {
            console.error("[Repo Produto] Erro ao listar produtos:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao listar produtos.", 500, false);
        }
    }
    async buscarPorId(id, incluirInativos = false) {
        let query = this.BASE_SELECT_QUERY + " WHERE p.produto_id = ?";
        if (!incluirInativos) {
            query += " AND p.ativo = TRUE";
        }
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [id]);
            return rows.length > 0 ? this.mapRowToProduto(rows[0]) : null;
        }
        catch (error) {
            console.error(`[Repo] Erro ao buscar produto ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao buscar produto ${id}.`, 500, false);
        }
    }
    async atualizar(id, data) {
        const fields = Object.keys(data).filter(key => data[key] !== undefined);
        const fieldMapping = {
            CATEGORIA_PRODUTO_categoria_id: 'CATEGORIA_PRODUTO_categoria_id',
            MARCA_PRODUTO_marca_id: 'MARCA_PRODUTO_marca_id',
            TIPO_PRODUTO_tipo_id: 'TIPO_PRODUTO_tipo_id',
        };
        const setParts = [];
        const values = [];
        fields.forEach(key => {
            if (!['produto_id', 'produto_status', 'ativo', 'data_registro', 'data_aprovacao', 'data_exclusao', 'motivo'].includes(key)) {
                const columnName = fieldMapping[key] || key;
                setParts.push(`${columnName} = ?`);
                values.push(data[key]);
            }
        });
        if (setParts.length === 0) {
            console.log(`[Repo] Nenhum campo válido para atualizar produto ${id}. Retornando registro atual.`);
            return this.buscarPorId(id);
        }
        const query = `UPDATE PRODUTO SET ${setParts.join(', ')} WHERE produto_id = ? AND ativo = TRUE`;
        values.push(id);
        console.log(`[Repo] Executando UPDATE para produto ${id}:`, query, values); // Log da query
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, values);
            console.log(`[Repo] Resultado UPDATE produto ${id}:`, result); // Log do resultado
            if (result.affectedRows === 0) {
                const existe = await this.buscarPorId(id, true);
                console.log(`[Repo] affectedRows = 0 para produto ${id}. Registro existente (ativo/inativo):`, existe);
                return existe && existe.ativo ? existe : null;
            }
            const produtoAtualizado = await this.buscarPorId(id);
            if (!produtoAtualizado) { // Checagem de segurança
                throw new app_error_1.AppError(`Falha ao buscar produto ${id} após atualização bem-sucedida.`, 500, false);
            }
            console.log(`[Repo] Produto ${id} atualizado com sucesso.`);
            return produtoAtualizado;
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new app_error_1.AppError(`Erro de duplicação ao atualizar produto ${id}. Verifique campos únicos.`, 409);
            }
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new app_error_1.AppError("Erro de referência: Categoria, Marca ou Tipo inválido(a) ou inativo(a) na atualização.", 400);
            }
            console.error(`[Repo] Erro ao atualizar produto ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao atualizar produto ${id}.`, 500, false);
        }
    }
    // Exclusão lógica de Produto
    async excluir(id) {
        const produtoAtual = await this.buscarPorId(id, false);
        if (!produtoAtual)
            return false;
        const query = "UPDATE PRODUTO SET ativo = FALSE, data_exclusao = NOW() WHERE produto_id = ? AND ativo = TRUE";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [id]);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error(`[Repo] Erro ao excluir logica produto ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao excluir produto ${id}.`, 500, false);
        }
    }
    // Métodos de Aprovação
    async listarPendentes(apenasAtivos = true) {
        let query = this.BASE_SELECT_QUERY + " WHERE p.produto_status = 'PENDENTE'";
        if (apenasAtivos) {
            query += " AND p.ativo = TRUE";
        }
        query += " ORDER BY p.data_registro DESC";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query);
            return rows.map(this.mapRowToProduto);
        }
        catch (error) {
            console.error("[Repo] Erro ao listar produtos pendentes:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao listar produtos pendentes.", 500, false);
        }
    }
    async aprovar(id) {
        const query = "UPDATE PRODUTO SET produto_status = 'APROVADO', data_aprovacao = NOW(), motivo = NULL WHERE produto_id = ? AND ativo = TRUE AND produto_status = 'PENDENTE'";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [id]);
            if (result.affectedRows === 0) {
                const produto = await this.buscarPorId(id, true);
                if (!produto || !produto.ativo || produto.produto_status !== 'PENDENTE')
                    return null;
            }
            return await this.buscarPorId(id);
        }
        catch (error) {
            console.error(`[Repo] Erro ao aprovar produto ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao aprovar produto ${id}.`, 500, false);
        }
    }
    async rejeitar(id, motivo) {
        const query = "UPDATE PRODUTO SET produto_status = 'REJEITADO', motivo = ? WHERE produto_id = ? AND ativo = TRUE AND produto_status = 'PENDENTE'";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [motivo, id]);
            if (result.affectedRows === 0) {
                const produto = await this.buscarPorId(id, true);
                if (!produto || !produto.ativo || produto.produto_status !== 'PENDENTE')
                    return null;
            }
            return await this.buscarPorId(id);
        }
        catch (error) {
            console.error(`[Repo] Erro ao rejeitar produto ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao rejeitar produto ${id}.`, 500, false);
        }
    }
}
exports.ProdutoMySQLRepository = ProdutoMySQLRepository;
//# sourceMappingURL=produto.mysql.repository.js.map