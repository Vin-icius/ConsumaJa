"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarcaService = void 0;
const app_error_1 = require("../../common/errors/app-error");
class MarcaService {
    constructor(marcaRepository) {
        this.marcaRepository = marcaRepository;
    }
    async criarMarca(createDto) {
        const nomeExistente = await this.marcaRepository.findByNome(createDto.marca_nome);
        if (nomeExistente) {
            throw new app_error_1.AppError(`A marca "${createDto.marca_nome}" já existe (ID: ${nomeExistente.marca_id}).`, 409);
        }
        try {
            const novaMarca = await this.marcaRepository.criar(createDto);
            return novaMarca;
        }
        catch (error) { /* ... tratamento genérico ... */
            if (error instanceof app_error_1.AppError)
                throw error;
            throw new app_error_1.AppError("Erro interno...", 500, false);
        }
    }
    async listarMarcas() {
        try {
            return await this.marcaRepository.listar(true);
        }
        catch (error) { /* ... tratamento genérico ... */
            if (error instanceof app_error_1.AppError)
                throw error;
            throw new app_error_1.AppError("Erro interno...", 500, false);
        }
    }
    async buscarMarcaPorId(id) {
        try {
            const marca = await this.marcaRepository.buscarPorId(id, false);
            if (!marca) {
                throw new app_error_1.AppError(`Marca com ID ${id} não encontrada ou inativa.`, 404);
            }
            return marca;
        }
        catch (error) { /* ... tratamento genérico ... */
            if (error instanceof app_error_1.AppError)
                throw error;
            throw new app_error_1.AppError("Erro interno...", 500, false);
        }
    }
    async atualizarMarca(id, updateDto) {
        const marcaExistente = await this.buscarMarcaPorId(id);
        if (updateDto.marca_nome && updateDto.marca_nome !== marcaExistente.marca_nome) {
            const outroComNome = await this.marcaRepository.findByNome(updateDto.marca_nome);
            if (outroComNome && outroComNome.marca_id !== id) {
                throw new app_error_1.AppError(`O nome de marca "${updateDto.marca_nome}" já está em uso.`, 409);
            }
        }
        try {
            const marcaAtualizada = await this.marcaRepository.atualizar(id, updateDto);
            if (!marcaAtualizada) {
                throw new app_error_1.AppError(`Falha ao atualizar: Marca com ID ${id} não encontrada ou inativa.`, 404);
            }
            return marcaAtualizada;
        }
        catch (error) { /* ... tratamento genérico ... */
            if (error instanceof app_error_1.AppError)
                throw error;
            throw new app_error_1.AppError("Erro interno...", 500, false);
        }
    }
    async excluirMarca(id) {
        try {
            const excluido = await this.marcaRepository.excluir(id);
            if (!excluido) {
                throw new app_error_1.AppError(`Marca com ID ${id} não encontrada ou já está inativa.`, 404);
            }
        }
        catch (error) { /* ... tratamento genérico ... */
            if (error instanceof app_error_1.AppError)
                throw error;
            throw new app_error_1.AppError("Erro interno...", 500, false);
        }
    }
}
exports.MarcaService = MarcaService;
//# sourceMappingURL=marca.service.js.map