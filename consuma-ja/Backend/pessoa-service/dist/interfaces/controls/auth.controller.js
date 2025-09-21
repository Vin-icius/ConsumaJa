"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const login_dto_1 = require("../dtos/login.dto");
const login_2fa_dto_1 = require("../dtos/login-2fa.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.login = this.login.bind(this);
        this.loginWith2FA = this.loginWith2FA.bind(this);
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
    async loginWith2FA(req, res, next) {
        const dto = (0, class_transformer_1.plainToClass)(login_2fa_dto_1.Login2FADto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        try {
            const authResponse = await this.authService.loginWith2FA(dto);
            res.status(200).json(authResponse); // Retorna token e dados do usuário
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map