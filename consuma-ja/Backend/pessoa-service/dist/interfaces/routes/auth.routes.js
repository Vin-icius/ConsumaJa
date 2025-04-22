"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/routes/auth.routes.ts
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controls/auth.controller");
const auth_service_1 = require("../../application/services/auth.service");
const pessoa_mysql_repository_1 = require("../../infrastructure/repositories/pessoa.mysql.repository");
const router = express_1.default.Router();
// Instanciação (Idealmente usar DI)
const pessoaRepository = new pessoa_mysql_repository_1.PessoaMySQLRepository();
const authService = new auth_service_1.AuthService(pessoaRepository);
const authController = new auth_controller_1.AuthController(authService);
// Rota de Login
router.post('/login', authController.login);
// Adicionar rota de registro se aplicável
// router.post('/register', ...);
// Adicionar rota para obter perfil do usuário logado (requer authMiddleware)
// import { authMiddleware } from '../middlewares/auth.middleware';
// router.get('/me', authMiddleware, ...);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map