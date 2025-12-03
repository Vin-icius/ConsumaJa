import express from 'express';
import { PromocaoController } from '../controls/promocao.controller';
import { PromocaoService } from '../../application/services/promocao.service';
import { PromocaoMySQLRepository } from '../../infrastructure/repositories/promocao.mysql.repository';
import { LoteProdMySQLRepository } from '../../infrastructure/repositories/loteprod.mysql.repository';
import { ProdutoMySQLRepository } from '../../infrastructure/repositories/produto.mysql.repository';
import { VendaController } from '../controls/venda.controller';
import { VendaService } from '../../application/services/venda.service';
import { VendaMySQLRepository } from '../../infrastructure/repositories/venda.mysql.repository';

const router = express.Router();

const promocaoRepository = new PromocaoMySQLRepository();
const loteProdRepository = new LoteProdMySQLRepository();
const produtoRepository = new ProdutoMySQLRepository();

const promocaoService = new PromocaoService(promocaoRepository, loteProdRepository, produtoRepository);
const promocaoController = new PromocaoController(promocaoService);

const vendaRepository = new VendaMySQLRepository();
const vendaService = new VendaService(vendaRepository, promocaoRepository, loteProdRepository);
const vendaController = new VendaController(vendaService);

router.post('/', /* authMiddleware, */ promocaoController.criar);
router.get('/', promocaoController.listar); // Lista ativas com filtros
router.get('/:id', promocaoController.buscarPorId);
router.put('/:id', /* authMiddleware, */ promocaoController.atualizar);
router.delete('/:id', /* authMiddleware, */ promocaoController.excluir);

router.post('/sale', /* authMiddleware, */ vendaController.criar);

export default router;