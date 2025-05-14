import express from 'express';
import { ProdutoController } from '../controls/produto.controller';
import { ProdutoService } from '../../application/services/produto.service';
import { ProdutoMySQLRepository } from '../../infrastructure/repositories/produto.mysql.repository';
import { CategoriaMySQLRepository } from '../../infrastructure/repositories/categoria.mysql.repository';
import { MarcaMySQLRepository } from '../../infrastructure/repositories/marca.mysql.repository';
import { TipoMySQLRepository } from '../../infrastructure/repositories/tipo.mysql.repository';

const router = express.Router();

// --- Instanciação (Idealmente usar DI) ---
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

// --- Rotas ---

// <<< ROTAS MAIS ESPECÍFICAS PRIMEIRO >>>
router.get('/pendentes', /* authMiddleware, */ produtoController.listarPendentes);
router.get('/para-selecao-promocao', produtoController.listarParaSelecao); // Para o formulário de promoção
// ------------------------------------

// Rota de listagem geral (pode ter query params, mas não params de rota conflitantes)
router.get('/', /* authMiddleware, */ produtoController.listarProdutos);

// Rotas de criação (sem ID na URL)
router.post('/', /* authMiddleware, */ produtoController.criarProduto);

// <<< ROTAS COM PARÂMETRO /:id VÊM DEPOIS DAS ESPECÍFICAS >>>
router.get('/:id', /* authMiddleware, */ produtoController.buscarProdutoPorId);
router.put('/:id', /* authMiddleware, */ produtoController.atualizarProduto);
router.delete('/:id', /* authMiddleware, */ produtoController.excluirProduto); // Exclusão lógica
router.patch('/:id/aprovar', /* authMiddleware, */ produtoController.aprovarProduto);
router.patch('/:id/rejeitar', /* authMiddleware, */ produtoController.rejeitarProduto);
// ---------------------------------------------------------

export default router;
