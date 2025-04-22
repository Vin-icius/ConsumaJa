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
        const dto = (0, class_transformer_1.plainToClass)(create_categoria_dto_1.CreateCategoriaDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            // Passa array de erros para middleware errorHandler formatar
            return next(errors);
        }
        try {
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
}
exports.CategoriaController = CategoriaController;
//# sourceMappingURL=categoria.controller.js.map