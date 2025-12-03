import express from 'express';
import { AuthController } from '../controls/auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { ConfigService } from '../../application/services/config.service';
import { PessoaMySQLRepository } from '../../infrastructure/repositories/pessoa.mysql.repository';
import { SessaoUsuarioMySQLRepository } from '../../infrastructure/repositories/sessao-usuario.mysql.repository';
import { ConfigMySQLRepository } from '../../infrastructure/repositories/config.mysql.repository';

const router = express.Router();

const pessoaRepository = new PessoaMySQLRepository();
const sessaoRepository = new SessaoUsuarioMySQLRepository();
const configRepository = new ConfigMySQLRepository();
const authService = new AuthService(pessoaRepository, sessaoRepository, configRepository);
const authController = new AuthController(authService);

// Rota de Login
router.post('/login', authController.login);
router.post('/sessao/validar', authController.validarSessao);
router.post('/logout', authController.encerrarSessao);
router.post('/verify-2fa', authController.verifyTwoFactor);

// Rota de Login com 2FA
// router.post('/login-2fa', authController.loginWith2FA);

export default router;