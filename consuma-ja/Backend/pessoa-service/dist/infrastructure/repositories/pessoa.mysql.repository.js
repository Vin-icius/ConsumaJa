"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PessoaMySQLRepository = void 0;
const mysql_connection_1 = require("../database/mysql.connection");
const app_error_1 = require("../../common/errors/app-error");
class PessoaMySQLRepository {
    // Helper para mapear a linha completa para a entidade Pessoa
    mapRowToPessoa(row) {
        const pessoa = {
            pessoa_id: row.pessoa_id,
            pessoa_nome: row.pessoa_nome,
            pessoa_email: row.pessoa_email,
            pessoa_telefone: row.pessoa_telefone,
            pessoa_tipo: row.pessoa_tipo,
            pessoa_login: row.pessoa_login,
            pessoa_senha: row.pessoa_senha, // Pode ser undefined se não selecionado
            pessoa_status: row.pessoa_status,
            data_criacao: row.data_criacao ? new Date(row.data_criacao) : null,
            ativo: Boolean(row.pessoa_status), // Mapeia 0/1 para false/true
        };
        if (row.pessoa_tipo === 'Fisica' && row.pessoa_cpf) {
            pessoa.fisica = {
                PESSOA_pessoa_id: row.pessoa_id,
                pessoa_cpf: row.pessoa_cpf,
                pessoa_documentoValidado: Boolean(row.pessoa_documentoValidado ?? 0),
                pessoa_fotoValidada: Boolean(row.pessoa_fotoValidada ?? 0),
            };
        }
        else if (row.pessoa_tipo === 'Juridica' && row.cnpj) {
            pessoa.juridica = {
                PESSOA_pessoa_id: row.pessoa_id,
                cnpj: row.cnpj,
                fornecedor_num: row.fornecedor_num ?? null, // Usa ?? null
            };
        }
        return pessoa;
    }
    // --- Métodos de Busca ---
    async findByLoginOrEmailOrDoc(identifier) {
        // <<< Incluir p.pessoa_senha na query de login >>>
        const query = `
            SELECT p.*, p.pessoa_senha, f.pessoa_cpf, f.pessoa_documentoValidado, f.pessoa_fotoValidada, j.cnpj, j.fornecedor_num
            FROM PESSOA p
            LEFT JOIN FISICA f ON p.pessoa_id = f.PESSOA_pessoa_id AND p.pessoa_tipo = 'Fisica'
            LEFT JOIN JURIDICA j ON p.pessoa_id = j.PESSOA_pessoa_id AND p.pessoa_tipo = 'Juridica'
            WHERE p.pessoa_login = ? OR p.pessoa_email = ? OR f.pessoa_cpf = ? OR j.cnpj = ?
            LIMIT 1
        `;
        const cleanedIdentifier = identifier.replace(/[.\-\/]/g, '');
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [identifier, identifier, cleanedIdentifier, cleanedIdentifier]);
            return rows.length > 0 ? this.mapRowToPessoa(rows[0]) : null;
        }
        catch (error) { /* ... tratamento mantido ... */
            throw new app_error_1.AppError("Erro DB...", 500, false);
        }
    }
    async findById(id) {
        // Não seleciona a senha por padrão em findById
        const query = `
            SELECT p.*, f.pessoa_cpf, f.pessoa_documentoValidado, f.pessoa_fotoValidada, j.cnpj, j.fornecedor_num
            FROM PESSOA p
            LEFT JOIN FISICA f ON p.pessoa_id = f.PESSOA_pessoa_id AND p.pessoa_tipo = 'Fisica'
            LEFT JOIN JURIDICA j ON p.pessoa_id = j.PESSOA_pessoa_id AND p.pessoa_tipo = 'Juridica'
            WHERE p.pessoa_id = ?
            LIMIT 1
        `;
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [id]);
            return rows.length > 0 ? this.mapRowToPessoa(rows[0]) : null;
        }
        catch (error) { /* ... tratamento mantido ... */
            throw new app_error_1.AppError(`Erro DB ao buscar usuário ${id}.`, 500, false);
        }
    }
    async findByEmail(email) {
        const query = "SELECT pessoa_id FROM PESSOA WHERE pessoa_email = ? LIMIT 1";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [email]);
            return rows.length > 0 ? { pessoa_id: rows[0].pessoa_id } : null;
        }
        catch (error) {
            console.error("[Repo] Erro ao buscar pessoa por email:", error);
            throw new app_error_1.AppError("Erro DB ao buscar por email.", 500, false);
        }
    }
    async findByLogin(login) {
        const query = "SELECT pessoa_id FROM PESSOA WHERE pessoa_login = ? LIMIT 1";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query, [login]);
            return rows.length > 0 ? { pessoa_id: rows[0].pessoa_id } : null;
        }
        catch (error) {
            console.error("[Repo] Erro ao buscar pessoa por login:", error);
            throw new app_error_1.AppError("Erro DB ao buscar por login.", 500, false);
        }
    }
    // --- Métodos de Modificação ---
    // Criar Pessoa (usando Transaction)
    async criar(data) {
        const { pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_senha, // Senha JÁ VEM HASHADA do Service
        fisicaData, juridicaData } = data;
        let connection;
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            connection = await mysql_connection_1.pool.getConnection();
            await connection.beginTransaction();
            // Inserir PESSOA
            const pessoaQuery = `INSERT INTO PESSOA (pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_senha, pessoa_status, data_criacao) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`;
            const pessoaStatus = 1; // Ativo
            const [resultPessoa] = await connection.query(pessoaQuery, [
                pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo,
                pessoa_login, pessoa_senha, pessoaStatus
            ]);
            const insertedId = resultPessoa.insertId;
            // Inserir FISICA ou JURIDICA
            if (pessoa_tipo === 'Fisica' && fisicaData) {
                const fisicaQuery = `INSERT INTO FISICA (PESSOA_pessoa_id, pessoa_cpf, pessoa_documentoValidado, pessoa_fotoValidada) VALUES (?, ?, ?, ?)`;
                await connection.query(fisicaQuery, [insertedId, fisicaData.pessoa_cpf, 0, 0]); // Assume validação = false
            }
            else if (pessoa_tipo === 'Juridica' && juridicaData) {
                const juridicaQuery = `INSERT INTO JURIDICA (PESSOA_pessoa_id, cnpj, fornecedor_num) VALUES (?, ?, ?)`;
                await connection.query(juridicaQuery, [insertedId, juridicaData.cnpj, juridicaData.fornecedor_num]);
            }
            else if (pessoa_tipo !== 'Admin') {
                throw new app_error_1.AppError(`Dados incompletos para tipo de pessoa '${pessoa_tipo}'`, 400); // Erro se não for Admin e faltar dados
            }
            await connection.commit();
            // Busca a pessoa recém-criada completa
            const novaPessoa = await this.findById(insertedId); // findById agora usa a pool padrão, não a connection
            if (!novaPessoa)
                throw new app_error_1.AppError("Falha ao buscar pessoa após criação.", 500, false);
            return novaPessoa;
        }
        catch (error) {
            if (connection)
                await connection.rollback();
            // Tratamento de erro DUP_ENTRY mantido...
            if (error.code === 'ER_DUP_ENTRY') { /* ... tratamento mantido ... */
                throw new app_error_1.AppError("Erro duplicado...", 409);
            }
            console.error("[Repo] Erro ao criar pessoa:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao criar pessoa.", 500, false);
        }
        finally {
            if (connection)
                connection.release();
        }
    }
    // Atualizar Pessoa (apenas tabela PESSOA)
    async atualizar(id, data) {
        const fields = Object.keys(data).filter(key => data[key] !== undefined);
        const setParts = [];
        const values = [];
        // Senha deve vir HASHADA do serviço se for atualizada
        fields.forEach(key => {
            // Valida se a chave é permitida para update (baseado em UpdatePessoaData)
            if (['pessoa_nome', 'pessoa_email', 'pessoa_telefone', 'pessoa_senha', 'pessoa_status'].includes(key)) {
                setParts.push(`${key} = ?`);
                values.push(data[key]);
            }
        });
        if (setParts.length === 0) {
            console.warn(`[Repo] Tentativa de atualizar pessoa ${id} sem dados válidos.`);
            return this.findById(id); // Retorna o usuário atual sem fazer update
        }
        const query = `UPDATE PESSOA SET ${setParts.join(', ')} WHERE pessoa_id = ? AND pessoa_status = 1`; // Só atualiza ativo
        values.push(id);
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, values);
            if (result.affectedRows === 0) {
                const existe = await this.findById(id);
                return existe && Boolean(existe.pessoa_status) ? existe : null;
            }
            return await this.findById(id);
        }
        catch (error) {
            // Tratamento de erro DUP_ENTRY mantido...
            if (error.code === 'ER_DUP_ENTRY') { /* ... tratamento mantido ... */
                throw new app_error_1.AppError("Email ou login duplicado.", 409);
            }
            console.error(`[Repo] Erro ao atualizar pessoa ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao atualizar pessoa ${id}.`, 500, false);
        }
    }
    // Exclusão Lógica (pessoa_status = 0)
    async excluir(id) {
        const pessoaAtual = await this.findById(id);
        // Só permite desativar se existir e estiver ativo (status=1)
        if (!pessoaAtual || !Boolean(pessoaAtual.pessoa_status)) {
            return false;
        }
        const query = "UPDATE PESSOA SET pessoa_status = 0 WHERE pessoa_id = ?"; // Atualiza status para 0
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [result] = await mysql_connection_1.pool.query(query, [id]);
            return result.affectedRows > 0; // Retorna true se a linha foi afetada
        }
        catch (error) {
            console.error(`[Repo] Erro ao excluir logica pessoa ${id}:`, error);
            throw new app_error_1.AppError(`Erro no banco de dados ao excluir pessoa ${id}.`, 500, false);
        }
    }
    // Listar (Exemplo básico, sem paginação ou filtros complexos)
    async listar(apenasAtivos = true) {
        let query = `
             SELECT p.*, f.pessoa_cpf, f.pessoa_documentoValidado, f.pessoa_fotoValidada, j.cnpj, j.fornecedor_num
             FROM PESSOA p
             LEFT JOIN FISICA f ON p.pessoa_id = f.PESSOA_pessoa_id AND p.pessoa_tipo = 'Fisica'
             LEFT JOIN JURIDICA j ON p.pessoa_id = j.PESSOA_pessoa_id AND p.pessoa_tipo = 'Juridica'
         `;
        if (apenasAtivos) {
            query += " WHERE p.pessoa_status = 1";
        }
        query += " ORDER BY p.pessoa_nome";
        try {
            if (!mysql_connection_1.pool)
                throw new app_error_1.AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await mysql_connection_1.pool.query(query);
            return rows.map(this.mapRowToPessoa);
        }
        catch (error) {
            console.error("[Repo] Erro ao listar pessoas:", error);
            throw new app_error_1.AppError("Erro no banco de dados ao listar pessoas.", 500, false);
        }
    }
}
exports.PessoaMySQLRepository = PessoaMySQLRepository;
//# sourceMappingURL=pessoa.mysql.repository.js.map