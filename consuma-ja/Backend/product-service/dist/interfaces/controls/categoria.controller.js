"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaController = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const create_categoria_dto_1 = require("../dtos/create-categoria.dto");
const update_categoria_dto_1 = require("../dtos/update-categoria.dto");
const app_error_1 = require("../../common/errors/app-error");
class CategoriaController {
    constructor(categoriaService) {
        this.categoriaService = categoriaService;
        // Binding explícito para garantir o 'this' correto
        this.criarCategoria = this.criarCategoria.bind(this);
        this.listarCategorias = this.listarCategorias.bind(this);
        this.buscarCategoriaPorId = this.buscarCategoriaPorId.bind(this);
        this.atualizarCategoria = this.atualizarCategoria.bind(this);
        this.excluirCategoria = this.excluirCategoria.bind(this);
    }
    async criarCategoria(req, res, next) {
        try {
            const fornecedorId = this.resolveFornecedorId(req);
            const dto = (0, class_transformer_1.plainToClass)(create_categoria_dto_1.CreateCategoriaDto, Object.assign(Object.assign({}, req.body), { fornecedor_pessoa_id: fornecedorId }));
            const errors = await (0, class_validator_1.validate)(dto);
            if (errors.length > 0) {
                return next(errors);
            }
            const categoria = await this.categoriaService.criarCategoria(dto);
            res.status(201).json(categoria);
        }
        catch (error) {
            next(error);
        }
    }
    async listarCategorias(req, res, next) {
        try {
            const categorias = await this.categoriaService.listarCategorias();
            res.status(200).json(categorias);
        }
        catch (error) {
            next(error);
        }
    }
    async buscarCategoriaPorId(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                throw new app_error_1.AppError("ID inválido fornecido.", 400);
            }
            const categoria = await this.categoriaService.buscarCategoriaPorId(id);
            res.status(200).json(categoria);
        }
        catch (error) {
            next(error);
        }
    }
    async atualizarCategoria(req, res, next) {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) {
            return next(new app_error_1.AppError("ID inválido fornecido.", 400));
        }
        const dto = (0, class_transformer_1.plainToClass)(update_categoria_dto_1.UpdateCategoriaDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        try {
            const categoria = await this.categoriaService.atualizarCategoria(id, dto);
            res.status(200).json(categoria);
        }
        catch (error) {
            next(error);
        }
    }
    async excluirCategoria(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                throw new app_error_1.AppError("ID inválido fornecido.", 400);
            }
            await this.categoriaService.excluirCategoria(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    resolveFornecedorId(req) {
        var _a, _b, _c, _d;
        if (!req.user) {
            throw new app_error_1.AppError('Usuário não autenticado.', 401);
        }
        if (req.user.tipo === 'Juridica') {
            return req.user.id;
        }
        if (req.user.tipo === 'Admin') {
            const raw = (_d = (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.fornecedor_pessoa_id) !== null && _b !== void 0 ? _b : (_c = req.body) === null || _c === void 0 ? void 0 : _c.fornecedorId) !== null && _d !== void 0 ? _d : null;
            if (raw === null || raw === undefined || raw === '') {
                return null;
            }
            const parsed = Number(raw);
            if (!Number.isFinite(parsed)) {
                throw new app_error_1.AppError('Fornecedor informado é inválido.', 400);
            }
            return parsed;
        }
        throw new app_error_1.AppError('Apenas administradores ou fornecedores podem gerenciar categorias.', 403);
    }
}
exports.CategoriaController = CategoriaController;
//# sourceMappingURL=categoria.controller.js.map