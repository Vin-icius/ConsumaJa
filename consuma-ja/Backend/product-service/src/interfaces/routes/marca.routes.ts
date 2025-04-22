import express from 'express';
import { MarcaController } from '../controls/marca.controller';
import { MarcaService } from '../../application/services/marca.service';
import { MarcaMySQLRepository } from '../../infrastructure/repositories/marca.mysql.repository';

const router = express.Router();

// Instanciação
const marcaRepository = new MarcaMySQLRepository();
const marcaService = new MarcaService(marcaRepository);
const marcaController = new MarcaController(marcaService);

// Rotas
router.post('/', marcaController.criarMarca);
router.get('/', marcaController.listarMarcas);
router.get('/:id', marcaController.buscarMarcaPorId);
router.put('/:id', marcaController.atualizarMarca);
router.delete('/:id', marcaController.excluirMarca);

export default router;