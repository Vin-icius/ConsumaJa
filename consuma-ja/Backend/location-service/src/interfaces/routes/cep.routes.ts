// src/interfaces/routes/cep.routes.ts
import { Router } from 'express';
import { CepController } from '../controls/cep.controller';
import { CepService } from '../../application/services/cep.service';
import { MySQLEstadoRepository } from '../../infrastructure/repositories/estado.mysql.repository';
import { MySQLCidadeRepository } from '../../infrastructure/repositories/cidade.mysql.repository';
import { ViaCepClient } from '../../infrastructure/clients/via-cep.client';

const router = Router();

// --- Instanciação e Injeção ---
const viaCepClient = new ViaCepClient();
const estadoRepository = new MySQLEstadoRepository();
const cidadeRepository = new MySQLCidadeRepository();
const cepService = new CepService(viaCepClient, estadoRepository, cidadeRepository);
const cepController = new CepController(cepService);

// --- Definição da Rota ---
// GET /api/location/cep/12345678 ou GET /api/location/cep/12345-678
router.get('/cep/:cep', (req, res, next) => cepController.lookupCep(req, res, next));

export default router;