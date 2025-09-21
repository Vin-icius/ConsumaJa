"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controls/auth.controller");
const auth_service_1 = require("../../application/services/auth.service");
const config_service_1 = require("../../application/services/config.service");
const pessoa_mysql_repository_1 = require("../../infrastructure/repositories/pessoa.mysql.repository");
const config_mysql_repository_1 = require("../../infrastructure/repositories/config.mysql.repository");
const router = express_1.default.Router();
const pessoaRepository = new pessoa_mysql_repository_1.PessoaMySQLRepository();
const configRepository = new config_mysql_repository_1.ConfigMySQLRepository();
const configService = new config_service_1.ConfigService(configRepository);
const authService = new auth_service_1.AuthService(pessoaRepository, configService);
const authController = new auth_controller_1.AuthController(authService);
// Rota de Login
router.post('/login', authController.login);
// Rota de Login com 2FA
router.post('/login-2fa', authController.loginWith2FA);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map