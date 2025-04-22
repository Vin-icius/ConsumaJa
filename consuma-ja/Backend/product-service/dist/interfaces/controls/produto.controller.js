"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoController = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const create_produto_dto_1 = require("../dtos/create-produto.dto");
const update_produto_dto_1 = require("../dtos/update-produto.dto");
const rejeitar_produto_dto_1 = require("../dtos/rejeitar-produto.dto");
const app_error_1 = require("../../common/errors/app-error");
class ProdutoController {
    constructor(produtoService) {
        this.produtoService = produtoService;
        // Binding
        this.criarProduto = this.criarProduto.bind(this);
        this.listarProdutos = this.listarProdutos.bind(this);
        this.buscarProdutoPorId = this.buscarProdutoPorId.bind(this);
        this.atualizarProduto = this.atualizarProduto.bind(this);
        this.excluirProduto = this.excluirProduto.bind(this);
        this.listarPendentes = this.listarPendentes.bind(this);
        this.aprovarProduto = this.aprovarProduto.bind(this);
        this.rejeitarProduto = this.rejeitarProduto.bind(this);
    }
    async criarProduto(req, res, next) {
        const dto = (0, class_transformer_1.plainToClass)(create_produto_dto_1.CreateProdutoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        try {
            const produto = await this.produtoService.criarProduto(dto);
            res.status(201).json(produto);
        }
        catch (error) {
            next(error);
        }
    }
    async listarProdutos(req, res, next) {
        try {
            const filtros = req.query;
            const produtos = await this.produtoService.listarProdutos(filtros);
            res.status(200).json(produtos);
        }
        catch (error) {
            next(error);
        }
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