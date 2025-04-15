import express from 'express';
import { TipoController } from '../controls/tipo.controller';
import { TipoService } from '../../application/services/tipo.service';
import { TipoMySQLRepository } from '../../infrastructure/repositories/tipo.mysql.repository';

const router = express.Router();
const tipoController = new TipoController(new TipoService(new TipoMySQLRepository()));

router.post('/', tipoController.criarTipo.bind(tipoController));
router.get('/', tipoController.listarTipos.bind(tipoController));
router.get('/:id', tipoController.buscarTipoPorId.bind(tipoController));
router.put('/:id', tipoController.atualizarTipo.bind(tipoController));
router.delete('/:id', tipoController.excluirTipo.bind(tipoController));

export default router;