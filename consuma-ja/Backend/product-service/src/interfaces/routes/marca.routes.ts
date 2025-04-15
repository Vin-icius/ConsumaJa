import express from 'express';
import { MarcaController } from '../../interfaces/controls/marca.controller';
import { MarcaService } from '../../application/services/marca.service';
import { MarcaMySQLRepository } from '../../infrastructure/repositories/marca.mysql.repository';

const router = express.Router();
const marcaController = new MarcaController(new MarcaService(new MarcaMySQLRepository()));

router.post('/', marcaController.criarMarca.bind(marcaController));
router.get('/', marcaController.listarMarcas.bind(marcaController));
router.get('/:id', marcaController.buscarMarcaPorId.bind(marcaController));
router.put('/:id', marcaController.atualizarMarca.bind(marcaController));
router.delete('/:id', marcaController.excluirMarca.bind(marcaController));

export default router;