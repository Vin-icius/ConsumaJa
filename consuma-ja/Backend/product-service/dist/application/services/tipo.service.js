"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoService = void 0;
const app_error_1 = require("../../common/errors/app-error");
class TipoService {
    constructor(tipoRepository) {
        this.tipoRepository = tipoRepository;
    }
    async criarTipo(createDto) {
        const nomeExistente = await this.tipoRepository.findByNome(createDto.tipo_nome);
        if (nomeExistente) {
            throw new app_error_1.AppError(`O tipo "${createDto.tipo_nome}" já existe (ID: ${nomeExistente.tipo_id}).`, 409);
        }
        try {
            // DTO tem os dados necessários para CreateTipoData
            const novoTipo = await this.tipoRepository.criar(createDto);
            return novoTipo;
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error("[Service] Erro ao criar tipo:", error);
            throw new app_error_1.AppError("Erro interno ao criar tipo.", 500, false);
        }
    }
    async listarTipos() {
        try {
            return await this.tipoRepository.listar(true);
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error("[Service] Erro ao listar tipos:", error);
            throw new app_error_1.AppError("Erro interno ao listar tipos.", 500, false);
        }
    }
    async buscarTipoPorId(id) {
        try {
            const tipo = await this.tipoRepository.buscarPorId(id, false);
            if (!tipo) {
                throw new app_error_1.AppError(`Tipo com ID ${id} não encontrado ou inativo.`, 404);
            }
            return tipo;
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error(`[Service] Erro ao buscar tipo ${id}:`, error);
            throw new app_error_1.AppError(`Erro interno ao buscar tipo ${id}.`, 500, false);
        }
    }
    async atualizarTipo(id, updateDto) {
        const tipoExistente = await this.buscarTipoPorId(id);
        if (updateDto.tipo_nome && updateDto.tipo_nome !== tipoExistente.tipo_nome) {
            const outroTipoComNome = await this.tipoRepository.findByNome(updateDto.tipo_nome);
            if (outroTipoComNome && outroTipoComNome.tipo_id !== id) {
                throw new app_error_1.AppError(`O nome de tipo "${updateDto.tipo_nome}" já está em uso pelo tipo ID ${outroTipoComNome.tipo_id}.`, 409);
            }
        }
        try {
            const tipoAtualizado = await this.tipoRepository.atualizar(id, updateDto);
            if (!tipoAtualizado) {
                throw new app_error_1.AppError(`Falha ao atualizar: Tipo com ID ${id} não encontrado ou inativo.`, 404);
            }
            return tipoAtualizado;
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error(`[Service] Erro ao atualizar tipo ${id}:`, error);
            throw new app_error_1.AppError(`Erro interno ao atualizar tipo ${id}.`, 500, false);
        }
    }
    async excluirTipo(id) {
        try {
            const excluido = await this.tipoRepository.excluir(id);
            if (!excluido) {
                throw new app_error_1.AppError(`Tipo com ID ${id} não encontrado ou já está inativo.`, 404);
            }
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error(`[Service] Erro ao excluir tipo ${id}:`, error);
            throw new app_error_1.AppError(`Erro interno ao excluir tipo ${id}.`, 500, false);
        }
    }
}
exports.TipoService = TipoService;
//# sourceMappingURL=tipo.service.js.map