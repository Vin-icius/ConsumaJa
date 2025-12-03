import express from 'express';
import { LoteProdController } from '../controls/loteprod.controller';
import { LoteProdService } from '../../application/services/loteprod.service';
import { LoteProdMySQLRepository } from '../../infrastructure/repositories/loteprod.mysql.repository';
import { ProdutoMySQLRepository } from '../../infrastructure/repositories/produto.mysql.repository';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

const produtoRepository = new ProdutoMySQLRepository();
const loteProdRepository = new LoteProdMySQLRepository();
const loteProdService = new LoteProdService(loteProdRepository, produtoRepository);
const loteProdController = new LoteProdController(loteProdService);

router.get('/disponiveis', loteProdController.listarDisponiveisParaSelecao);

router.use(authMiddleware);

router.get('/', loteProdController.listar);

router.post('/', loteProdController.criar);

router.get('/:id', loteProdController.buscarPorId);

router.put('/:id', loteProdController.atualizar);

router.delete('/:id', loteProdController.excluir);

export default router;