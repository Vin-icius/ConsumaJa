import express from 'express';
import { ProdutoController } from '../controls/produto.controller';
import { ProdutoService } from '../../application/services/produto.service';
import { ProdutoMySQLRepository } from '../../infrastructure/repositories/produto.mysql.repository';
import { CategoriaMySQLRepository } from '../../infrastructure/repositories/categoria.mysql.repository';
import { MarcaMySQLRepository } from '../../infrastructure/repositories/marca.mysql.repository';
import { TipoMySQLRepository } from '../../infrastructure/repositories/tipo.mysql.repository';
// import { productImageUpload } from '../../config/product-images.config';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

const categoriaRepository = new CategoriaMySQLRepository();
const marcaRepository = new MarcaMySQLRepository();
const tipoRepository = new TipoMySQLRepository();
const produtoRepository = new ProdutoMySQLRepository();
const produtoService = new ProdutoService(
    produtoRepository,
    categoriaRepository,
    marcaRepository,
    tipoRepository
);
const produtoController = new ProdutoController(produtoService);

router.use(authMiddleware);

router.get('/pendentes', produtoController.listarPendentes);
router.get('/para-selecao-promocao', produtoController.listarParaSelecao); // Para o formulário de promoção

router.get('/', produtoController.listarProdutos);

router.post('/', produtoController.criarProduto);
// router.post('/:id/imagem', productImageUpload.single('imagem'), produtoController.uploadImagem);

router.get('/:id', produtoController.buscarProdutoPorId);
router.put('/:id', produtoController.atualizarProduto);
router.delete('/:id', produtoController.excluirProduto); // Exclusão lógica
router.patch('/:id/aprovar', produtoController.aprovarProduto);
router.patch('/:id/rejeitar', produtoController.rejeitarProduto);

export default router;
