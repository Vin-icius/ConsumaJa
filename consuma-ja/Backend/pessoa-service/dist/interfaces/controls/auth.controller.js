"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const login_dto_1 = require("../dtos/login.dto");
const login_2fa_dto_1 = require("../dtos/login-2fa.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const sessao_dto_1 = require("../dtos/sessao.dto");
const twofactor_verify_dto_1 = require("../dtos/twofactor-verify.dto");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.login = this.login.bind(this);
        this.validarSessao = this.validarSessao.bind(this);
        this.encerrarSessao = this.encerrarSessao.bind(this);
        this.verifyTwoFactor = this.verifyTwoFactor.bind(this);
    }
    async login(req, res, next) {
        const dto = (0, class_transformer_1.plainToClass)(login_dto_1.LoginDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        try {
            const authResponse = await this.authService.login(dto);
            res.status(200).json(authResponse); // Retorna token e dados do usuário
        }
        catch (error) {
            next(error);
        }
    }
    async validarSessao(req, res, next) {
        const dto = (0, class_transformer_1.plainToClass)(sessao_dto_1.SessaoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        try {
            const resultado = await this.authService.validarSessao(dto.sessao_id);
            res.status(200).json(resultado);
        }
        catch (error) {
            next(error);
        }
    }
    async encerrarSessao(req, res, next) {
        const dto = (0, class_transformer_1.plainToClass)(sessao_dto_1.SessaoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        try {
            await this.authService.encerrarSessao(dto.sessao_id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    async verifyTwoFactor(req, res, next) {
        const dto = (0, class_transformer_1.plainToClass)(twofactor_verify_dto_1.TwoFactorVerifyDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        try {
            const resultado = await this.authService.verificarCodigo2FA(dto.token, dto.codigo_2fa);
            res.status(200).json(resultado);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map