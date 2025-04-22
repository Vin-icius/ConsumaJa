"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const login_dto_1 = require("../dtos/login.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.login = this.login.bind(this);
    }
    async login(req, res, next) {
        const dto = (0, class_transformer_1.plainToClass)(login_dto_1.LoginDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            // Passa erros de validação para o errorHandler
            return next(errors);
        }
        try {
            const authResponse = await this.authService.login(dto);
            res.status(200).json(authResponse); // Retorna token e dados do usuário
        }
        catch (error) {
            // Passa AppError (401, 403, 500) ou outros para o errorHandler
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map