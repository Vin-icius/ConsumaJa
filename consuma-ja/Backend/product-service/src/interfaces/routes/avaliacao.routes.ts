import express from 'express';
import { ProdutoMySQLRepository } from '../../infrastructure/repositories/produto.mysql.repository';
import { AvaliacaoMySQLRepository } from '../../infrastructure/repositories/avaliacao.mysql.repository';
import { AvaliacaoService } from '../../application/services/avaliacao.service';
import { AvaliacaoController } from '../controls/avaliacao.controller';

const router = express.Router();

// --- Instanciação das Dependências ---
const produtoRepository = new ProdutoMySQLRepository(); // Necessário para o AvaliacaoService
const avaliacaoRepository = new AvaliacaoMySQLRepository();
// const pedidoRepository = new PedidoAPIRepository(); // Exemplo de como seria
const avaliacaoService = new AvaliacaoService(avaliacaoRepository, produtoRepository);
const avaliacaoController = new AvaliacaoController(avaliacaoService);

// --- Definição das Rotas para Avaliacao ---

// Rota para listar todas as avaliações de um produto específico
// GET /api/product/produtos/:produtoId/avaliacoes
router.get('/produtos/:produtoId/avaliacoes', avaliacaoController.listarPorProduto);

// Rota para um cliente criar uma avaliação para um produto que comprou
// POST /api/product/avaliacoes
// O corpo da requisição deve conter produto_id, pedido_id, nota, e opcionalmente comentario
router.post('/avaliacoes', /* authMiddleware, */ avaliacaoController.criar);

// Rota para um cliente atualizar sua própria avaliação
// PUT /api/product/avaliacoes/:id
router.put('/avaliacoes/:id', /* authMiddleware, */ avaliacaoController.atualizar);

// Rota para um cliente excluir sua própria avaliação
// DELETE /api/product/avaliacoes/:id
router.delete('/avaliacoes/:id', /* authMiddleware, */ avaliacaoController.excluir);

export default router;