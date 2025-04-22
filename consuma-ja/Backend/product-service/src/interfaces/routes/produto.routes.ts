import express from 'express';
import { ProdutoController } from '../controls/produto.controller';
import { ProdutoService } from '../../application/services/produto.service';
import { ProdutoMySQLRepository } from '../../infrastructure/repositories/produto.mysql.repository';
import { CategoriaMySQLRepository } from '../../infrastructure/repositories/categoria.mysql.repository';
import { MarcaMySQLRepository } from '../../infrastructure/repositories/marca.mysql.repository';
import { TipoMySQLRepository } from '../../infrastructure/repositories/tipo.mysql.repository';

const router = express.Router();

const produtoRepository = new ProdutoMySQLRepository();
const categoriaRepository = new CategoriaMySQLRepository();
const marcaRepository = new MarcaMySQLRepository();
const tipoRepository = new TipoMySQLRepository();

const produtoService = new ProdutoService(
    produtoRepository,
    categoriaRepository,
    marcaRepository,
    tipoRepository
);
const produtoController = new ProdutoController(produtoService);

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