import express from 'express';
// Importe as dependências de Avaliação que já criamos
import { AvaliacaoMySQLRepository } from '../../infrastructure/repositories/avaliacao.mysql.repository';
import { AvaliacaoService } from '../../application/services/avaliacao.service';
import { AvaliacaoController } from '../controls/avaliacao.controller';

const router = express.Router();

// Instanciação das dependências
const avaliacaoRepository = new AvaliacaoMySQLRepository();
const avaliacaoService = new AvaliacaoService(avaliacaoRepository);
const avaliacaoController = new AvaliacaoController(avaliacaoService);

// A rota agora é a raiz '/', pois o prefixo '/avaliacoes' será definido em main.ts
router.post('/', avaliacaoController.criar);

export default router;