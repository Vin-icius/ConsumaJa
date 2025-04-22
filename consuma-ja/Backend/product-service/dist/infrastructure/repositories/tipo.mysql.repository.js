"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoMySQLRepository = void 0;
const mysql_connection_1 = require("../database/mysql.connection");
const app_error_1 = require("../../common/errors/app-error");
class TipoMySQLRepository {
    // Helper para mapear linha do DB para entidade
    mapRowToTipo(row) {
        const tipo = {
            tipo_id: row.tipo_id,
            tipo_nome: row.tipo_nome,
            ativo: Boolean(row.ativo),
        };
        return tipo;
    }
    async findByNome(nome) {
        const query = "SELECT * FROM TIPO_PRODUTO WHERE tipo_nome = ? AND ativo = TRUE LIMIT 1";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [nome]);
            return rows.length > 0 ? this.mapRowToTipo(rows[0]) : null;
        }
        catch (error) {
            console.error("[Repo] Erro ao buscar tipo por nome:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao buscar tipo.", 500, false);
        }
    }
    async criar(data) {
        const { tipo_nome } = data;
        const query = "INSERT INTO TIPO_PRODUTO (tipo_nome) VALUES (?)";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [tipo_nome]);
            const insertedId = result.insertId;
            const novoTipo = await this.buscarPorId(insertedId, true);
            if (!novoTipo) {
                throw new app_error_1.AppError("Falha ao buscar tipo após criação.", 500, false);
            }
            return novoTipo;
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new app_error_1.AppError(`O tipo "${tipo_nome}" já existe.`, 409);
            }
            console.error("[Repo] Erro ao criar tipo:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao criar tipo.", 500, false);
        }
    }
    async listar(apenasAtivos = true) {
        let query = "SELECT * FROM TIPO_PRODUTO";
        if (apenasAtivos) {
            query += " WHERE ativo = TRUE";
        }
        query += " ORDER BY tipo_nome"; // Ordena alfabeticamente
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query);
            return rows.map(this.mapRowToTipo);
        }
        catch (error) {
            console.error("[Repo] Erro ao listar tipos:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao listar tipos.", 500, false);
        }
    }
    async buscarPorId(id, incluirInativos = false) {
        let query = "SELECT * FROM TIPO_PRODUTO WHERE tipo_id = ?";
        if (!incluirInativos) {
            query += " AND ativo = TRUE";
        }
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [id]);
            return rows.length > 0 ? this.mapRowToTipo(rows[0]) : null;
        }
        catch (error) {
            console.error(`[Repo] Erro ao buscar tipo ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao buscar tipo ${id}.`, 500, false);
        }
    }
    async atualizar(id, data) {
        const { tipo_nome } = data;
        // Se 'tipo_nome' não foi passado, não há o que atualizar
        if (tipo_nome === undefined) {
            return this.buscarPorId(id);
        }
        // Query para atualizar apenas se estiver ativo
        const query = "UPDATE TIPO_PRODUTO SET tipo_nome = ? WHERE tipo_id = ? AND ativo = TRUE";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [tipo_nome, id]);
            if (result.affectedRows === 0) {
                const existe = await this.buscarPorId(id, true);
                return existe && existe.ativo ? existe : null;
            }
            const tipoAtualizado = await this.buscarPorId(id);
            if (!tipoAtualizado) { // Checagem de segurança
                throw new app_error_1.AppError("Falha ao buscar tipo após atualização bem-sucedida.", 500, false);
            }
            return tipoAtualizado;
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') { // Tentou atualizar para nome duplicado
                throw new app_error_1.AppError(`O nome de tipo "${tipo_nome}" já está em uso.`, 409);
            }
            console.error(`[Repo] Erro ao atualizar tipo ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao atualizar tipo ${id}.`, 500, false);
        }
    }
    // Implementa EXCLUSÃO LÓGICA
    async excluir(id) {
        // Verifica se existe e está ativo antes de tentar desativar
        const tipoAtual = await this.buscarPorId(id, false);
        if (!tipoAtual) {
            return false;
        }
        const query = "UPDATE TIPO_PRODUTO SET ativo = FALSE WHERE tipo_id = ?";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [id]);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error(`[Repo] Erro ao excluir logicamente tipo ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao excluir tipo ${id}.`, 500, false);
        }
    }
}
exports.TipoMySQLRepository = TipoMySQLRepository;
//# sourceMappingURL=tipo.mysql.repository.js.map