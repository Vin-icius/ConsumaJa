import express from 'express';
import { TipoController } from '../controls/tipo.controller';
import { TipoService } from '../../application/services/tipo.service';
import { TipoMySQLRepository } from '../../infrastructure/repositories/tipo.mysql.repository';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const tipoController = new TipoController(new TipoService(new TipoMySQLRepository()));

router.post('/', authMiddleware, tipoController.criarTipo.bind(tipoController));
router.get('/', tipoController.listarTipos.bind(tipoController));
router.get('/:id', tipoController.buscarTipoPorId.bind(tipoController));
router.put('/:id', authMiddleware, tipoController.atualizarTipo.bind(tipoController));
router.delete('/:id', authMiddleware, tipoController.excluirTipo.bind(tipoController));

export default router;