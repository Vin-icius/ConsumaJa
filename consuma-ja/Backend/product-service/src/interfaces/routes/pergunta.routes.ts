import express from 'express';
// Importe as dependências necessárias (Controller, Service, etc.) que já criamos
import { PerguntaMySQLRepository } from '../../infrastructure/repositories/pergunta.mysql.repository';
import { PerguntaService } from '../../application/services/pergunta.service';
import { PerguntaController } from '../controls/pergunta.controller';

const router = express.Router();

// Instanciação das dependências
const perguntaRepository = new PerguntaMySQLRepository();
const perguntaService = new PerguntaService(perguntaRepository);
const perguntaController = new PerguntaController(perguntaService);

// A rota agora é a raiz '/', pois o prefixo '/perguntas' será definido em main.ts
router.get('/ativas', perguntaController.listarAtivas);

export default router;