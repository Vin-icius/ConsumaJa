"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResponseDTO = void 0;
class AuthResponseDTO {
    constructor(token, pessoa_id, pessoa_nome, pessoa_tipo) {
        this.token = token;
        this.pessoa_id = pessoa_id;
        this.pessoa_nome = pessoa_nome;
        this.pessoa_tipo = pessoa_tipo;
    }
}
exports.AuthResponseDTO = AuthResponseDTO;
