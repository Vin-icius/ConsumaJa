import { Router } from 'express';
import { EstadoController } from '../controls/estado.controller';
import { EstadoService } from '../../application/services/estado.service';
import { MySQLEstadoRepository } from '../../infrastructure/repositories/estado.mysql.repository';

const router = Router();

// --- Instanciação e Injeção de Dependências ---
// Idealmente, usar um container de injeção de dependência (ex: InversifyJS, Tsyringe)
const estadoRepository = new MySQLEstadoRepository();
const estadoService = new EstadoService(estadoRepository);
const estadoController = new EstadoController(estadoService);

router.post('/estados', (req, res, next) => estadoController.create(req, res, next));
router.get('/estados', (req, res, next) => estadoController.getAll(req, res, next));
router.get('/estados/:id', (req, res, next) => estadoController.getById(req, res, next));
router.put('/estados/:id', (req, res, next) => estadoController.update(req, res, next)); // Ou PATCH
router.delete('/estados/:id', (req, res, next) => estadoController.delete(req, res, next));

export default router;