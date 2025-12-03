"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoService = void 0;
const app_error_1 = require("../../common/errors/app-error");
class ProdutoService {
    constructor(produtoRepository, categoriaRepository, marcaRepository, tipoRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.marcaRepository = marcaRepository;
        this.tipoRepository = tipoRepository;
    }
    async validarForeignKeys(data) {
        const { categoria_id, marca_id, tipo_id } = data;
        const errors = [];
        const [categoriaExists, marcaExists, tipoExists] = await Promise.all([
            categoria_id ? this.categoriaRepository.buscarPorId(categoria_id) : Promise.resolve(true),
            marca_id ? this.marcaRepository.buscarPorId(marca_id) : Promise.resolve(true),
            tipo_id ? this.tipoRepository.buscarPorId(tipo_id) : Promise.resolve(true),
        ]);
        if (categoria_id && !categoriaExists)
            errors.push(`Categoria com ID ${categoria_id} não encontrada ou inativa.`);
        if (marca_id && !marcaExists)
            errors.push(`Marca com ID ${marca_id} não encontrada ou inativa.`);
        if (tipo_id && !tipoExists)
            errors.push(`Tipo com ID ${tipo_id} não encontrado ou inativo.`);
        if (errors.length > 0) {
            throw new app_error_1.AppError(`Erro de referência: ${errors.join(' ')}`, 400);
        }
    }
    async criarProduto(createDto) {
        var _a;
        // 1. Validar FKs antes de criar
        await this.validarForeignKeys({
            categoria_id: createDto.CATEGORIA_PRODUTO_categoria_id,
            marca_id: createDto.MARCA_PRODUTO_marca_id,
            tipo_id: createDto.TIPO_PRODUTO_tipo_id,
        });
        try {
            const dataToCreate = {
                produto_nome: createDto.produto_nome,
                produto_medida: createDto.produto_medida,
                produto_precoOriginal: createDto.produto_precoOriginal,
                descricao: (_a = createDto.descricao) !== null && _a !== void 0 ? _a : null,
                CATEGORIA_PRODUTO_categoria_id: createDto.CATEGORIA_PRODUTO_categoria_id,
                MARCA_PRODUTO_marca_id: createDto.MARCA_PRODUTO_marca_id,
                TIPO_PRODUTO_tipo_id: createDto.TIPO_PRODUTO_tipo_id,
                fornecedor_pessoa_id: createDto.fornecedor_pessoa_id,
            };
            const novoProduto = await this.produtoRepository.criar(dataToCreate);
            return novoProduto;
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error("[Service] Erro ao criar produto:", error);
            throw new app_error_1.AppError("Erro interno ao criar produto.", 500, false);
        }
    }
    async listarProdutos(filtros) {
        const page = filtros.page || 1;
        const limit = filtros.limit || 10;
        try {
            const { data, total } = await this.produtoRepository.listar(filtros); // Repositório retorna {data, total}
            return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
        }
        catch (error) { /* ... */
            throw new app_error_1.AppError("Erro interno...", 500, false);
        }
    }
    async buscarProdutoPorId(id) {
        try {
            const produto = await this.produtoRepository.buscarPorId(id, false);
            if (!produto) {
                throw new app_error_1.AppError(`Produto com ID ${id} não encontrado ou inativo.`, 404);
            }
            if (!produto.categoria || !produto.marca || !produto.tipo) {
                console.warn(`Produto ${id} encontrado, mas uma de suas relações (categoria/marca/tipo) está inativa ou ausente.`);
            }
            return produto;
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error(`[Service] Erro ao buscar produto ${id}:`, error);
            throw new app_error_1.AppError(`Erro interno ao buscar produto ${id}.`, 500, false);
        }
    }
    async atualizarProduto(id, updateDto) {
        // 1. Garante que produto existe e está ativo
        const produtoExistente = await this.buscarProdutoPorId(id);
        // 2. Validar FKs SE elas estiverem sendo alteradas no DTO
        await this.validarForeignKeys({
            categoria_id: updateDto.CATEGORIA_PRODUTO_categoria_id,
            marca_id: updateDto.MARCA_PRODUTO_marca_id,
            tipo_id: updateDto.TIPO_PRODUTO_tipo_id,
        });
        try {
            const produtoAtualizado = await this.produtoRepository.atualizar(id, updateDto);
            if (!produtoAtualizado) {
                throw new app_error_1.AppError(`Falha ao atualizar: Produto com ID ${id} não encontrado ou inativo.`, 404);
            }
            return produtoAtualizado;
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error(`[Service] Erro ao atualizar produto ${id}:`, error);
            throw new app_error_1.AppError(`Erro interno ao atualizar produto ${id}.`, 500, false);
        }
    }
    async excluirProduto(id) {
        try {
            // Exclusão lógica
            const excluido = await this.produtoRepository.excluir(id);
            if (!excluido) {
                throw new app_error_1.AppError(`Produto com ID ${id} não encontrado ou já está inativo.`, 404);
            }
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error(`[Service] Erro ao excluir produto ${id}:`, error);
            throw new app_error_1.AppError(`Erro interno ao excluir produto ${id}.`, 500, false);
        }
    }
    // --- Métodos de Aprovação ---
    async listarProdutosPendentes() {
        try {
            return await this.produtoRepository.listarPendentes(true);
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error("[Service] Erro ao listar produtos pendentes:", error);
            throw new app_error_1.AppError("Erro interno ao listar produtos pendentes.", 500, false);
        }
    }
    async aprovarProduto(id) {
        try {
            const produtoAprovado = await this.produtoRepository.aprovar(id);
            if (!produtoAprovado) {
                throw new app_error_1.AppError(`Produto com ID ${id} não encontrado, inativo ou não está pendente para aprovação.`, 404); // Ou 400 Bad Request?
            }
            return produtoAprovado;
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error(`[Service] Erro ao aprovar produto ${id}:`, error);
            throw new app_error_1.AppError(`Erro interno ao aprovar produto ${id}.`, 500, false);
        }
    }
    async rejeitarProduto(id, rejeitarDto) {
        try {
            const produtoRejeitado = await this.produtoRepository.rejeitar(id, rejeitarDto.motivo);
            if (!produtoRejeitado) {
                throw new app_error_1.AppError(`Produto com ID ${id} não encontrado, inativo ou não está pendente para rejeição.`, 404); // Ou 400
            }
            return produtoRejeitado;
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            console.error(`[Service] Erro ao rejeitar produto ${id}:`, error);
            throw new app_error_1.AppError(`Erro interno ao rejeitar produto ${id}.`, 500, false);
        }
    }
    async listarParaSelecaoPromocao(filtros) {
        console.log("[Service Produto] Listando produtos para seleção (paginado) com filtros:", filtros);
        const page = filtros.page || 1;
        const limit = filtros.limit || 10;
        try {
            const { data, total } = await this.produtoRepository.listarParaSelecaoPromocao(Object.assign(Object.assign({}, filtros), { page, limit }));
            const totalPages = Math.ceil(total / limit);
            console.log(`[Service Produto] Produtos para seleção: ${data.length} de ${total} total. Página ${page}/${totalPages}.`);
            return { data, total, page, limit, totalPages };
        }
        catch (error) { /* ... */
            throw new app_error_1.AppError("Erro interno...", 500, false);
        }
    }
}
exports.ProdutoService = ProdutoService;
//# sourceMappingURL=produto.service.js.map