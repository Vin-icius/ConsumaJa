// src/interfaces/routes/cidade.routes.ts
import { Router } from 'express';
import { CidadeController } from '../controls/cidade.controller';
import { CidadeService } from '../../application/services/cidade.service';
import { MySQLCidadeRepository } from '../../infrastructure/repositories/cidade.mysql.repository';
import { MySQLEstadoRepository } from '../../infrastructure/repositories/estado.mysql.repository'; // Precisa do repo de estado

const router = Router();

// --- Instanciação e Injeção ---
const cidadeRepository = new MySQLCidadeRepository();
const estadoRepository = new MySQLEstadoRepository(); // Instanciar repo de estado
const cidadeService = new CidadeService(cidadeRepository, estadoRepository); // Injetar ambos
const cidadeController = new CidadeController(cidadeService);

// --- Rotas ---
router.post('/cidades', cidadeController.create); // POST /api/location/cidades
router.get('/cidades', cidadeController.getAll);   // GET /api/location/cidades?nome=...
router.get('/estados/:estadoId/cidades', cidadeController.getByEstadoId); // GET /api/location/estados/35/cidades

// Rotas com ID simples da cidade
router.get('/cidades/:id', cidadeController.getById);    // GET /api/location/cidades/5022
router.put('/cidades/:id', cidadeController.update);    // PUT /api/location/cidades/5022
router.delete('/cidades/:id', cidadeController.delete); // DELETE /api/location/cidades/5022

export default router;