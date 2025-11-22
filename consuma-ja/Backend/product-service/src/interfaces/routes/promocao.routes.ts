import express from 'express';
import { PromocaoController } from '../controls/promocao.controller';
import { PromocaoService } from '../../application/services/promocao.service';
import { PromocaoMySQLRepository } from '../../infrastructure/repositories/promocao.mysql.repository';
import { LoteProdMySQLRepository } from '../../infrastructure/repositories/loteprod.mysql.repository';
import { ProdutoMySQLRepository } from '../../infrastructure/repositories/produto.mysql.repository';
import { VendaController } from '../controls/venda.controller';
import { VendaService } from '../../application/services/venda.service';
import { VendaMySQLRepository } from '../../infrastructure/repositories/venda.mysql.repository';
import { ShoppingCartMySQLRepository } from '../../infrastructure/repositories/shopping-cart.mysql.repository';

const router = express.Router();

// Instanciação (Idealmente usar DI)
const promocaoRepository = new PromocaoMySQLRepository();
const loteProdRepository = new LoteProdMySQLRepository();
const produtoRepository = new ProdutoMySQLRepository();

const promocaoService = new PromocaoService(promocaoRepository, loteProdRepository, produtoRepository);
const promocaoController = new PromocaoController(promocaoService);

// Para venda
const vendaRepository = new VendaMySQLRepository();
const shoppingCartRepository = new ShoppingCartMySQLRepository();
const vendaService = new VendaService(vendaRepository, promocaoRepository, loteProdRepository, shoppingCartRepository);
const vendaController = new VendaController(vendaService);

// Rotas
router.post('/', /* authMiddleware, */ promocaoController.criar);
router.get('/', promocaoController.listar); // Lista ativas com filtros
router.get('/:id', promocaoController.buscarPorId);
router.put('/:id', /* authMiddleware, */ promocaoController.atualizar);
router.delete('/:id', /* authMiddleware, */ promocaoController.excluir);

// Rota para venda
router.post('/sale', /* authMiddleware, */ vendaController.criar);

export default router;