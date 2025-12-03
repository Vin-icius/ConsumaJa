import express from 'express';
import { AvaliacaoMySQLRepository } from '../../infrastructure/repositories/avaliacao.mysql.repository';
import { AvaliacaoService } from '../../application/services/avaliacao.service';
import { AvaliacaoController } from '../controls/avaliacao.controller';
import { VendaMySQLRepository } from '../../infrastructure/repositories/venda.mysql.repository';
import { NotificationMySQLRepository } from '../../infrastructure/repositories/notification.mysql.repository';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

const avaliacaoRepository = new AvaliacaoMySQLRepository();
const vendaRepository = new VendaMySQLRepository();
const notificationRepository = new NotificationMySQLRepository();
const avaliacaoService = new AvaliacaoService(avaliacaoRepository, vendaRepository, notificationRepository);
const avaliacaoController = new AvaliacaoController(avaliacaoService);

router.use(authMiddleware);

router.get('/', avaliacaoController.listar);
router.post('/', avaliacaoController.criar);

export default router;