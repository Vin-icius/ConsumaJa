"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pessoa = exports.PessoaTipo = void 0;
var PessoaTipo;
(function (PessoaTipo) {
    PessoaTipo["FISICA"] = "Fisica";
    PessoaTipo["JURIDICA"] = "Juridica";
    PessoaTipo["ADMIN"] = "Admin";
})(PessoaTipo || (exports.PessoaTipo = PessoaTipo = {}));
class Pessoa {
    constructor(pessoa_id, pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_senha, pessoa_status, data_criacao) {
        this.pessoa_id = pessoa_id;
        this.pessoa_nome = pessoa_nome;
        this.pessoa_email = pessoa_email;
        this.pessoa_telefone = pessoa_telefone;
        this.pessoa_tipo = pessoa_tipo;
        this.pessoa_login = pessoa_login;
        this.pessoa_senha = pessoa_senha;
        this.pessoa_status = pessoa_status;
        this.data_criacao = data_criacao;
    }
}
exports.Pessoa = Pessoa;
