import express from 'express';
import { AuthController } from '../controls/auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { PessoaMySQLRepository } from '../../infrastructure/repositories/pessoa.mysql.repository';

const router = express.Router();

const pessoaRepository = new PessoaMySQLRepository();
const authService = new AuthService(pessoaRepository);
const authController = new AuthController(authService);

// Rota de Login
router.post('/login', authController.login);

export default router;