"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoController = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const create_produto_dto_1 = require("../dtos/create-produto.dto");
const update_produto_dto_1 = require("../dtos/update-produto.dto");
const rejeitar_produto_dto_1 = require("../dtos/rejeitar-produto.dto");
const listar_produtos_selecao_query_dto_1 = require("../dtos/listar-produtos-selecao-query.dto");
const listar_produtos_query_dto_1 = require("../dtos/listar-produtos-query.dto");
const app_error_1 = require("../../common/errors/app-error");
class ProdutoController {
    constructor(produtoService) {
        this.produtoService = produtoService;
        // Bind de todos os métodos que serão usados como handlers de rota
        this.criarProduto = this.criarProduto.bind(this);
        this.listarProdutos = this.listarProdutos.bind(this);
        this.buscarProdutoPorId = this.buscarProdutoPorId.bind(this);
        this.atualizarProduto = this.atualizarProduto.bind(this);
        this.excluirProduto = this.excluirProduto.bind(this);
        this.aprovarProduto = this.aprovarProduto.bind(this);
        this.rejeitarProduto = this.rejeitarProduto.bind(this);
        this.listarPendentes = this.listarPendentes.bind(this);
        this.listarParaSelecao = this.listarParaSelecao.bind(this);
        this.uploadImagem = this.uploadImagem.bind(this);
    }
    async criarProduto(req, res, next) {
        try {
            const fornecedorId = this.resolveFornecedorId(req);
            const dto = (0, class_transformer_1.plainToClass)(create_produto_dto_1.CreateProdutoDto, Object.assign(Object.assign({}, req.body), { fornecedor_pessoa_id: fornecedorId }));
            const errors = await (0, class_validator_1.validate)(dto);
            if (errors.length > 0) {
                return next(errors);
            }
            const produto = await this.produtoService.criarProduto(dto);
            res.status(201).json(produto);
        }
        catch (error) {
            next(error);
        }
    }
    async listarProdutos(req, res, next) {
        try {
            const dto = (0, class_transformer_1.plainToClass)(listar_produtos_query_dto_1.ListarProdutosQueryDto, req.query);
            const errors = await (0, class_validator_1.validate)(dto);
            if (errors.length > 0) {
                return next(errors);
            }
            if (!req.user) {
                throw new app_error_1.AppError('Usuário não autenticado.', 401);
            }
            if (req.user.tipo === 'Juridica') {
                dto.fornecedorId = req.user.id;
            }
            else if (req.user.tipo !== 'Admin') {
                throw new app_error_1.AppError('Apenas administradores ou fornecedores podem acessar a listagem de produtos.', 403);
            }
            const produtos = await this.produtoService.listarProdutos(dto);
            res.status(200).json(produtos);
        }
        catch (error) {
            next(error);
        }
    }
    async listarParaSelecao(req, res, next) {
        console.log('[ProdutoController] GET /para-selecao-promocao - Query Params:', req.query); // Log Adicionado
        const dto = (0, class_transformer_1.plainToClass)(listar_produtos_selecao_query_dto_1.ListarProdutosSelecaoQueryDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            console.error('[ProdutoController] Erros de validação DTO listarParaSelecao:', errors);
            return next(errors);
        }
        try {
            // 'this' aqui deve referenciar a instância do ProdutoController
            // e this.produtoService deve estar definido.
            const produtos = await this.produtoService.listarParaSelecaoPromocao(dto);
            console.log('[ProdutoController] Produtos para seleção listados:', produtos.data.length);
            res.status(200).json(produtos);
        }
        catch (error) {
            console.error('[ProdutoController] Erro capturado em listarParaSelecao:', error);
            next(error);
        }
    }
    resolveFornecedorId(req) {
        var _a, _b, _c;
        if (!req.user) {
            throw new app_error_1.AppError('Usuário não autenticado.', 401);
        }
        if (req.user.tipo === 'Juridica') {
            return req.user.id;
        }
        if (req.user.tipo === 'Admin') {
            const raw = (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.fornecedor_pessoa_id) !== null && _b !== void 0 ? _b : (_c = req.body) === null || _c === void 0 ? void 0 : _c.fornecedorId;
            if (raw === undefined || raw === null || raw === '') {
                throw new app_error_1.AppError('Informe o fornecedor responsável pelo produto.', 400);
            }
            const parsed = Number(raw);
            if (!Number.isFinite(parsed) || parsed <= 0) {
                throw new app_error_1.AppError('Fornecedor informado é inválido.', 400);
            }
            return parsed;
        }
        throw new app_error_1.AppError('Apenas administradores ou fornecedores podem criar produtos.', 403);
    }
    async buscarProdutoPorId(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                throw new app_error_1.AppError("ID inválido.", 400);
            }
            const produto = await this.produtoService.buscarProdutoPorId(id);
            res.status(200).json(produto);
        }
        catch (error) {
            next(error);
        }
    }
    async atualizarProduto(req, res, next) {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) {
            return next(new app_error_1.AppError("ID inválido.", 400));
        }
        const dto = (0, class_transformer_1.plainToClass)(update_produto_dto_1.UpdateProdutoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        if (Object.keys(dto).length === 0) {
            return next(new app_error_1.AppError("Nenhum dado para atualizar.", 400));
        }
        try {
            const produto = await this.produtoService.atualizarProduto(id, dto);
            res.status(200).json(produto);
        }
        catch (error) {
            next(error);
        }
    }
    async excluirProduto(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                throw new app_error_1.AppError("ID inválido.", 400);
            }
            await this.produtoService.excluirProduto(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    async uploadImagem(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                throw new app_error_1.AppError("ID inválido.", 400);
            }
            if (!req.file) {
                throw new app_error_1.AppError("Nenhuma imagem enviada para o produto.", 400);
            }
            const produto = await this.produtoService.definirImagemPrincipal(id, req.file.filename);
            res.status(200).json({
                message: "Imagem do produto atualizada com sucesso.",
                produto,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // --- Rotas de Aprovação ---
    async listarPendentes(req, res, next) {
        try {
            const produtos = await this.produtoService.listarProdutosPendentes();
            res.status(200).json(produtos);
        }
        catch (error) {
            next(error);
        }
    }
    async aprovarProduto(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                throw new app_error_1.AppError("ID inválido.", 400);
            }
            const produto = await this.produtoService.aprovarProduto(id);
            res.status(200).json(produto);
        }
        catch (error) {
            next(error);
        }
    }
    async rejeitarProduto(req, res, next) {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) {
            return next(new app_error_1.AppError("ID inválido.", 400));
        }
        const dto = (0, class_transformer_1.plainToClass)(rejeitar_produto_dto_1.RejeitarProdutoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        try {
            const produto = await this.produtoService.rejeitarProduto(id, dto);
            res.status(200).json(produto);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProdutoController = ProdutoController;
//# sourceMappingURL=produto.controller.js.map