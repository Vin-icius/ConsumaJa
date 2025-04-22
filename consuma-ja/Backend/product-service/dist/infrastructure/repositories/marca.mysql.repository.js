"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarcaMySQLRepository = void 0;
const mysql_connection_1 = require("../database/mysql.connection");
const app_error_1 = require("../../common/errors/app-error");
class MarcaMySQLRepository {
    mapRowToMarca(row) {
        const marca = {
            marca_id: row.marca_id,
            marca_nome: row.marca_nome,
            ativo: Boolean(row.ativo),
        };
        return marca;
    }
    async findByNome(nome) {
        const query = "SELECT * FROM MARCA_PRODUTO WHERE marca_nome = ? AND ativo = TRUE LIMIT 1";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [nome]);
            return rows.length > 0 ? this.mapRowToMarca(rows[0]) : null;
        }
        catch (error) {
            console.error("[Repo] Erro ao buscar marca por nome:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao buscar marca.", 500, false);
        }
    }
    async criar(data) {
        const { marca_nome } = data;
        const query = "INSERT INTO MARCA_PRODUTO (marca_nome) VALUES (?)";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [marca_nome]);
            const insertedId = result.insertId;
            const novaMarca = await this.buscarPorId(insertedId, true);
            if (!novaMarca)
                throw new app_error_1.AppError("Falha ao buscar marca após criação.", 500, false);
            return novaMarca;
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new app_error_1.AppError(`A marca "${marca_nome}" já existe.`, 409);
            }
            console.error("[Repo] Erro ao criar marca:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao criar marca.", 500, false);
        }
    }
    async listar(apenasAtivos = true) {
        let query = "SELECT * FROM MARCA_PRODUTO";
        if (apenasAtivos) {
            query += " WHERE ativo = TRUE";
        }
        query += " ORDER BY marca_nome";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query);
            return rows.map(this.mapRowToMarca);
        }
        catch (error) {
            console.error("[Repo] Erro ao listar marcas:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao listar marcas.", 500, false);
        }
    }
    async buscarPorId(id, incluirInativos = false) {
        let query = "SELECT * FROM MARCA_PRODUTO WHERE marca_id = ?";
        if (!incluirInativos) {
            query += " AND ativo = TRUE";
        }
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [id]);
            return rows.length > 0 ? this.mapRowToMarca(rows[0]) : null;
        }
        catch (error) {
            console.error(`[Repo] Erro ao buscar marca ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao buscar marca ${id}.`, 500, false);
        }
    }
    async atualizar(id, data) {
        const { marca_nome } = data;
        if (marca_nome === undefined)
            return this.buscarPorId(id);
        const query = "UPDATE MARCA_PRODUTO SET marca_nome = ? WHERE marca_id = ? AND ativo = TRUE";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [marca_nome, id]);
            if (result.affectedRows === 0) {
                const existe = await this.buscarPorId(id, true);
                return existe && existe.ativo ? existe : null;
            }
            return await this.buscarPorId(id);
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new app_error_1.AppError(`O nome de marca "${marca_nome}" já está em uso.`, 409);
            }
            console.error(`[Repo] Erro ao atualizar marca ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao atualizar marca ${id}.`, 500, false);
        }
    }
    // Exclusão lógica
    async excluir(id) {
        const marcaAtual = await this.buscarPorId(id, false);
        if (!marcaAtual)
            return false;
        const query = "UPDATE MARCA_PRODUTO SET ativo = FALSE WHERE marca_id = ?";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [id]);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error(`[Repo] Erro ao excluir logicamente marca ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao excluir marca ${id}.`, 500, false);
        }
    }
}
exports.MarcaMySQLRepository = MarcaMySQLRepository;
//# sourceMappingURL=marca.mysql.repository.js.map