"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaMySQLRepository = void 0;
const mysql_connection_1 = require("../database/mysql.connection");
const app_error_1 = require("../../common/errors/app-error");
class CategoriaMySQLRepository {
    // Helper para mapear linha do DB para entidade
    mapRowToCategoria(row) {
        const categoria = {
            categoria_id: row.categoria_id,
            categoria_nome: row.categoria_nome,
            ativo: Boolean(row.ativo),
        };
        return categoria; // Retorna a variável tipada
        // ------------------------------------------------------------------
    }
    async findByNome(nome) {
        // console.log('[Repo Categoria - findByNome] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
        const query = "SELECT * FROM CATEGORIA_PRODUTO WHERE categoria_nome = ? AND ativo = TRUE LIMIT 1";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [nome]);
            return rows.length > 0 ? this.mapRowToCategoria(rows[0]) : null;
        }
        catch (error) {
            console.error("[Repo] Erro ao buscar categoria por nome:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao buscar categoria.", 500, false);
        }
    }
    async criar(data) {
        // console.log('[Repo Categoria - criar] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
        const { categoria_nome } = data;
        const query = "INSERT INTO CATEGORIA_PRODUTO (categoria_nome) VALUES (?)";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [categoria_nome]);
            const insertedId = result.insertId;
            const novaCategoria = await this.buscarPorId(insertedId, true);
            if (!novaCategoria)
                throw new app_error_1.AppError("Falha ao buscar categoria após criação.", 500, false);
            return novaCategoria;
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new app_error_1.AppError(`A categoria "${categoria_nome}" já existe.`, 409);
            }
            console.error("[Repo] Erro ao criar categoria:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao criar categoria.", 500, false);
        }
    }
    async listar(apenasAtivos = true) {
        // console.log('[Repo Categoria - listar] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
        let query = "SELECT * FROM CATEGORIA_PRODUTO";
        if (apenasAtivos) {
            query += " WHERE ativo = TRUE";
        }
        query += " ORDER BY categoria_nome";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query);
            return rows.map(this.mapRowToCategoria);
        }
        catch (error) {
            console.error("[Repo] Erro ao listar categorias:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao listar categorias.", 500, false);
        }
    }
    async buscarPorId(id, incluirInativos = false) {
        // console.log('[Repo Categoria - buscarPorId] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
        let query = "SELECT * FROM CATEGORIA_PRODUTO WHERE categoria_id = ?";
        if (!incluirInativos) {
            query += " AND ativo = TRUE";
        }
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [id]);
            return rows.length > 0 ? this.mapRowToCategoria(rows[0]) : null;
        }
        catch (error) {
            console.error(`[Repo] Erro ao buscar categoria ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao buscar categoria ${id}.`, 500, false);
        }
    }
    async atualizar(id, data) {
        // console.log('[Repo Categoria - atualizar] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
        const { categoria_nome } = data;
        if (categoria_nome === undefined) {
            return this.buscarPorId(id);
        }
        const query = "UPDATE CATEGORIA_PRODUTO SET categoria_nome = ? WHERE categoria_id = ? AND ativo = TRUE";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [categoria_nome, id]);
            if (result.affectedRows === 0) {
                const existe = await this.buscarPorId(id, true);
                return existe && existe.ativo ? existe : null;
            }
            return await this.buscarPorId(id);
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new app_error_1.AppError(`O nome de categoria "${categoria_nome}" já está em uso.`, 409);
            }
            console.error(`[Repo] Erro ao atualizar categoria ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao atualizar categoria ${id}.`, 500, false);
        }
    }
    async excluir(id) {
        // console.log('[Repo Categoria - excluir] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
        const categoriaAtual = await this.buscarPorId(id, false);
        if (!categoriaAtual) {
            return false;
        }
        const query = "UPDATE CATEGORIA_PRODUTO SET ativo = FALSE WHERE categoria_id = ?";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [id]);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error(`[Repo] Erro ao excluir logicamente categoria ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao excluir categoria ${id}.`, 500, false);
        }
    }
}
exports.CategoriaMySQLRepository = CategoriaMySQLRepository;
//# sourceMappingURL=categoria.mysql.repository.js.map