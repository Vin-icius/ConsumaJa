"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarcaController = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const create_marca_dto_1 = require("../dtos/create-marca.dto");
const update_marca_dto_1 = require("../dtos/update-marca.dto");
const app_error_1 = require("../../common/errors/app-error");
class MarcaController {
    constructor(marcaService) {
        this.marcaService = marcaService;
        this.criarMarca = this.criarMarca.bind(this);
        this.listarMarcas = this.listarMarcas.bind(this);
        this.buscarMarcaPorId = this.buscarMarcaPorId.bind(this);
        this.atualizarMarca = this.atualizarMarca.bind(this);
        this.excluirMarca = this.excluirMarca.bind(this);
    }
    async criarMarca(req, res, next) {
        const dto = (0, class_transformer_1.plainToClass)(create_marca_dto_1.CreateMarcaDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        try {
            const marca = await this.marcaService.criarMarca(dto);
            res.status(201).json(marca);
        }
        catch (error) {
            next(error);
        }
    }
    async listarMarcas(req, res, next) {
        try {
            const marcas = await this.marcaService.listarMarcas();
            res.status(200).json(marcas);
        }
        catch (error) {
            next(error);
        }
    }
    async buscarMarcaPorId(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                throw new app_error_1.AppError("ID inválido.", 400);
            }
            const marca = await this.marcaService.buscarMarcaPorId(id);
            res.status(200).json(marca);
        }
        catch (error) {
            next(error);
        }
    }
    async atualizarMarca(req, res, next) {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) {
            return next(new app_error_1.AppError("ID inválido.", 400));
        }
        const dto = (0, class_transformer_1.plainToClass)(update_marca_dto_1.UpdateMarcaDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        if (Object.keys(dto).length === 0) {
            return next(new app_error_1.AppError("Nenhum dado para atualizar.", 400));
        }
        try {
            const marca = await this.marcaService.atualizarMarca(id, dto);
            res.status(200).json(marca);
        }
        catch (error) {
            next(error);
        }
    }
    async excluirMarca(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                throw new app_error_1.AppError("ID inválido.", 400);
            }
            await this.marcaService.excluirMarca(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MarcaController = MarcaController;
//# sourceMappingURL=marca.controller.js.map