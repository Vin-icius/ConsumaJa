"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PessoaMysqlRepository = void 0;
const pessoa_entity_1 = require("../../domain/entities/pessoa.entity");
const fisica_entity_1 = require("../../domain/entities/fisica.entity");
const juridica_entity_1 = require("../../domain/entities/juridica.entity");
class PessoaMysqlRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async findByLogin(login) {
        const [rows] = await this.pool.query('SELECT * FROM PESSOA WHERE pessoa_login = ?', [login]);
        if (rows.length === 0)
            return null;
        const row = rows[0];
        return new pessoa_entity_1.Pessoa(row.pessoa_id, row.pessoa_nome, row.pessoa_email, row.pessoa_telefone, row.pessoa_tipo, row.pessoa_login, row.pessoa_senha, row.pessoa_status, row.data_criacao ? new Date(row.data_criacao) : null);
    }
    async findFisicaByPessoaId(pessoaId) {
        const [rows] = await this.pool.query('SELECT * FROM FISICA WHERE PESSOA_pessoa_id = ?', [pessoaId]);
        if (rows.length === 0)
            return null;
        const row = rows[0];
        return new fisica_entity_1.Fisica(row.pessoa_cpf, Boolean(row.pessoa_documentoValidado), Boolean(row.pessoa_fotoValidada), await this.findByLogin(row.PESSOA_pessoa_id.toString()));
    }
    async findJuridicaByPessoaId(pessoaId) {
        const [rows] = await this.pool.query('SELECT * FROM JURIDICA WHERE PESSOA_pessoa_id = ?', [pessoaId]);
        if (rows.length === 0)
            return null;
        const row = rows[0];
        return new juridica_entity_1.Juridica(row.fornecedor_cnpj, row.fornecedor_num, await this.findByLogin(row.PESSOA_pessoa_id.toString()));
    }
}
exports.PessoaMysqlRepository = PessoaMysqlRepository;
