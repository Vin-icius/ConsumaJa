import express from 'express';
import { PromocaoController } from '../controls/promocao.controller';
import { PromocaoService } from '../../application/services/promocao.service';
import { PromocaoMySQLRepository } from '../../infrastructure/repositories/promocao.mysql.repository';
import { LoteProdMySQLRepository } from '../../infrastructure/repositories/loteprod.mysql.repository';
import { ProdutoMySQLRepository } from '../../infrastructure/repositories/produto.mysql.repository';

const router = express.Router();

// Instanciação (Idealmente usar DI)
const promocaoRepository = new PromocaoMySQLRepository();
const loteProdRepository = new LoteProdMySQLRepository();
const produtoRepository = new ProdutoMySQLRepository();

const promocaoService = new PromocaoService(promocaoRepository, loteProdRepository, produtoRepository);
const promocaoController = new PromocaoController(promocaoService);

// Rotas
router.post('/', /* authMiddleware, */ promocaoController.criar);
router.get('/', promocaoController.listar); // Lista ativas com filtros
router.get('/:id', promocaoController.buscarPorId);
router.put('/:id', /* authMiddleware, */ promocaoController.atualizar);
router.delete('/:id', /* authMiddleware, */ promocaoController.excluir);

export default router;