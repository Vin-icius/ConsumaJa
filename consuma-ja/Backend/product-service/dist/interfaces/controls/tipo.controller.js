"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoController = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const create_tipo_dto_1 = require("../dtos/create-tipo.dto");
const update_tipo_dto_1 = require("../dtos/update-tipo.dto");
const app_error_1 = require("../../common/errors/app-error");
class TipoController {
    constructor(tipoService) {
        this.tipoService = tipoService;
        // Binding
        this.criarTipo = this.criarTipo.bind(this);
        this.listarTipos = this.listarTipos.bind(this);
        this.buscarTipoPorId = this.buscarTipoPorId.bind(this);
        this.atualizarTipo = this.atualizarTipo.bind(this);
        this.excluirTipo = this.excluirTipo.bind(this);
    }
    async criarTipo(req, res, next) {
        const dto = (0, class_transformer_1.plainToClass)(create_tipo_dto_1.CreateTipoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        try {
            const tipo = await this.tipoService.criarTipo(dto);
            res.status(201).json(tipo);
        }
        catch (error) {
            next(error);
        }
    }
    async listarTipos(req, res, next) {
        try {
            const tipos = await this.tipoService.listarTipos();
            res.status(200).json(tipos);
        }
        catch (error) {
            next(error);
        }
    }
    async buscarTipoPorId(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                throw new app_error_1.AppError("ID inválido.", 400);
            }
            const tipo = await this.tipoService.buscarTipoPorId(id);
            res.status(200).json(tipo);
        }
        catch (error) {
            next(error);
        }
    }
    async atualizarTipo(req, res, next) {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) {
            return next(new app_error_1.AppError("ID inválido.", 400));
        }
        const dto = (0, class_transformer_1.plainToClass)(update_tipo_dto_1.UpdateTipoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        if (Object.keys(dto).length === 0) {
            return next(new app_error_1.AppError("Nenhum dado para atualizar.", 400));
        }
        try {
            const tipo = await this.tipoService.atualizarTipo(id, dto);
            res.status(200).json(tipo);
        }
        catch (error) {
            next(error);
        }
    }
    async excluirTipo(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                throw new app_error_1.AppError("ID inválido.", 400);
            }
            await this.tipoService.excluirTipo(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TipoController = TipoController;
//# sourceMappingURL=tipo.controller.js.map