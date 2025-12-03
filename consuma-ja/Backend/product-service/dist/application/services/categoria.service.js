"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaService = void 0;
const app_error_1 = require("../../common/errors/app-error");
class CategoriaService {
    constructor(categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }
    async criarCategoria(createDto) {
        var _a;
        const fornecedorId = (_a = createDto.fornecedor_pessoa_id) !== null && _a !== void 0 ? _a : null;
        // Validação de Unicidade ANTES de tentar criar
        const nomeExistente = await this.categoriaRepository.findByNome(createDto.categoria_nome, fornecedorId);
        if (nomeExistente) {
            throw new app_error_1.AppError(`A categoria "${createDto.categoria_nome}" já existe (ID: ${nomeExistente.categoria_id}).`, 409);
        }
        try {
            const novaCategoria = await this.categoriaRepository.criar({
                categoria_nome: createDto.categoria_nome,
                fornecedor_pessoa_id: fornecedorId,
            });
            return novaCategoria;
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error("[Service] Erro ao criar categoria:", error);
            throw new app_error_1.AppError("Erro interno ao criar categoria.", 500, false);
        }
    }
    async listarCategorias() {
        try {
            return await this.categoriaRepository.listar(true);
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error("[Service] Erro ao listar categorias:", error);
            throw new app_error_1.AppError("Erro interno ao listar categorias.", 500, false);
        }
    }
    async buscarCategoriaPorId(id) {
        try {
            const categoria = await this.categoriaRepository.buscarPorId(id, false);
            if (!categoria) {
                throw new app_error_1.AppError(`Categoria com ID ${id} não encontrada ou está inativa.`, 404);
            }
            return categoria;
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error(`[Service] Erro ao buscar categoria ${id}:`, error);
            throw new app_error_1.AppError(`Erro interno ao buscar categoria ${id}.`, 500, false);
        }
    }
    async atualizarCategoria(id, updateDto) {
        var _a;
        const categoriaExistente = await this.buscarCategoriaPorId(id);
        if (updateDto.categoria_nome && updateDto.categoria_nome !== categoriaExistente.categoria_nome) {
            const outraCategoriaComNome = await this.categoriaRepository.findByNome(updateDto.categoria_nome, (_a = categoriaExistente.fornecedor_pessoa_id) !== null && _a !== void 0 ? _a : null);
            if (outraCategoriaComNome && outraCategoriaComNome.categoria_id !== id) {
                throw new app_error_1.AppError(`O nome de categoria "${updateDto.categoria_nome}" já está em uso pela categoria ID ${outraCategoriaComNome.categoria_id}.`, 409);
            }
        }
        try {
            const categoriaAtualizada = await this.categoriaRepository.atualizar(id, updateDto);
            if (!categoriaAtualizada) {
                console.warn(`[Service] Categoria ${id} não encontrada ou inativa durante a atualização, mas passou na checagem inicial.`);
                throw new app_error_1.AppError(`Falha ao atualizar: Categoria com ID ${id} não encontrada ou inativa.`, 404);
            }
            return categoriaAtualizada;
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error(`[Service] Erro ao atualizar categoria ${id}:`, error);
            throw new app_error_1.AppError(`Erro interno ao atualizar categoria ${id}.`, 500, false);
        }
    }
    async excluirCategoria(id) {
        try {
            const excluido = await this.categoriaRepository.excluir(id);
            if (!excluido) {
                throw new app_error_1.AppError(`Categoria com ID ${id} não encontrada ou já está inativa.`, 404);
            }
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error(`[Service] Erro ao excluir categoria ${id}:`, error);
            throw new app_error_1.AppError(`Erro interno ao excluir categoria ${id}.`, 500, false);
        }
    }
}
exports.CategoriaService = CategoriaService;
//# sourceMappingURL=categoria.service.js.map