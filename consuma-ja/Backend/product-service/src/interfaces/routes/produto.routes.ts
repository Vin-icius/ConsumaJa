import express from 'express';
import { ProdutoController } from '../controls/produto.controller';
import { ProdutoService } from '../../application/services/produto.service';
import { ProdutoMySQLRepository } from '../../infrastructure/repositories/produto.mysql.repository';
import { CategoriaMySQLRepository } from '../../infrastructure/repositories/categoria.mysql.repository';
import { MarcaMySQLRepository } from '../../infrastructure/repositories/marca.mysql.repository';
import { TipoMySQLRepository } from '../../infrastructure/repositories/tipo.mysql.repository';

const router = express.Router();

<<<<<<< HEAD
const produtoRepository = new ProdutoMySQLRepository();
const categoriaRepository = new CategoriaMySQLRepository();
const marcaRepository = new MarcaMySQLRepository();
const tipoRepository = new TipoMySQLRepository();

=======
// --- Instanciação (Idealmente usar DI) ---
const categoriaRepository = new CategoriaMySQLRepository();
const marcaRepository = new MarcaMySQLRepository();
const tipoRepository = new TipoMySQLRepository();
const produtoRepository = new ProdutoMySQLRepository();
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
const produtoService = new ProdutoService(
    produtoRepository,
    categoriaRepository,
    marcaRepository,
    tipoRepository
);
const produtoController = new ProdutoController(produtoService);

<<<<<<< HEAD
// --- DEFINIR ROTAS ESPECÍFICAS PRIMEIRO ---
router.get('/pendentes', produtoController.listarPendentes); // <<< Rota para listar pendentes
router.patch('/:id/aprovar', produtoController.aprovarProduto); // <<< Rota para aprovar (PATCH é mais semântico)
router.patch('/:id/rejeitar', /* validateDto(RejeitarProdutoDto), */ produtoController.rejeitarProduto); // <<< Rota para rejeitar (PATCH)

// --- DEPOIS, AS ROTAS CRUD MAIS GENÉRICAS ---
router.post('/', /* validateDto(CreateProdutoDto), */ produtoController.criarProduto); // POST /produtos
router.get('/', produtoController.listarProdutos); // GET /produtos

// --- ROTAS COM PARÂMETRO ':id' VÊM POR ÚLTIMO ---
router.get('/:id', produtoController.buscarProdutoPorId); // GET /produtos/:id
router.put('/:id', /* validateDto(UpdateProdutoDto), */ produtoController.atualizarProduto); // PUT /produtos/:id
router.delete('/:id', produtoController.excluirProduto); // DELETE /produtos/:id

export default router;
=======
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
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
