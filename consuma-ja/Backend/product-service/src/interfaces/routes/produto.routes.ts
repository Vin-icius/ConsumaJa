import express from 'express';
import { ProdutoController } from '../../interfaces/controls/produto.controller';
import { ProdutoService } from '../../application/services/produto.service';
import { ProdutoMySQLRepository } from '../../infrastructure/repositories/produto.mysql.repository';

const router = express.Router();
const produtoController = new ProdutoController(new ProdutoService(new ProdutoMySQLRepository()));

router.post('/', produtoController.criarProduto.bind(produtoController));
router.put('/prod/:id', produtoController.atualizarProduto.bind(produtoController));
router.get('/prod/:id', produtoController.buscarProdutoPorId.bind(produtoController));
router.get('/', produtoController.listarProdutos.bind(produtoController));
router.get('/pend/', produtoController.listarPendentes.bind(produtoController));
router.delete('/:id', produtoController.excluirProduto.bind(produtoController));

router.put('/prod/:id/aprovar', produtoController.aprovarProduto.bind(produtoController));
router.put('/prod/:id/rejeitar', produtoController.rejeitarProduto.bind(produtoController));

export default router;