import express from 'express';
import { PerguntaMySQLRepository } from '../../infrastructure/repositories/pergunta.mysql.repository';
import { PerguntaService } from '../../application/services/pergunta.service';
import { PerguntaController } from '../controls/pergunta.controller';

const router = express.Router();

const perguntaRepository = new PerguntaMySQLRepository();
const perguntaService = new PerguntaService(perguntaRepository);
const perguntaController = new PerguntaController(perguntaService);

router.get('/ativas', perguntaController.listarAtivas);

export default router;