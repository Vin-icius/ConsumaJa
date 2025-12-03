"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controls/auth.controller");
const auth_service_1 = require("../../application/services/auth.service");
const pessoa_mysql_repository_1 = require("../../infrastructure/repositories/pessoa.mysql.repository");
const sessao_usuario_mysql_repository_1 = require("../../infrastructure/repositories/sessao-usuario.mysql.repository");
const config_mysql_repository_1 = require("../../infrastructure/repositories/config.mysql.repository");
const router = express_1.default.Router();
const pessoaRepository = new pessoa_mysql_repository_1.PessoaMySQLRepository();
const sessaoRepository = new sessao_usuario_mysql_repository_1.SessaoUsuarioMySQLRepository();
const configRepository = new config_mysql_repository_1.ConfigMySQLRepository();
const authService = new auth_service_1.AuthService(pessoaRepository, sessaoRepository, configRepository);
const authController = new auth_controller_1.AuthController(authService);
// Rota de Login
router.post('/login', authController.login);
router.post('/sessao/validar', authController.validarSessao);
router.post('/logout', authController.encerrarSessao);
router.post('/verify-2fa', authController.verifyTwoFactor);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map