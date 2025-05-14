import express from 'express';
import { LoteProdController } from '../controls/loteprod.controller';
import { LoteProdService } from '../../application/services/loteprod.service';
import { LoteProdMySQLRepository } from '../../infrastructure/repositories/loteprod.mysql.repository';
import { ProdutoMySQLRepository } from '../../infrastructure/repositories/produto.mysql.repository';

const router = express.Router();

// --- Instanciação das Dependências ---
const produtoRepository = new ProdutoMySQLRepository(); // Necessário para LoteProdService
const loteProdRepository = new LoteProdMySQLRepository();
const loteProdService = new LoteProdService(loteProdRepository, produtoRepository);
const loteProdController = new LoteProdController(loteProdService);

// --- Definição das Rotas para LoteProd ---

// Rota para buscar lotes disponíveis (usada no formulário de promoção)
// GET /api/product/lotes/disponiveis
router.get('/disponiveis', loteProdController.listarDisponiveisParaSelecao);

// Rotas CRUD para LoteProd (para gerenciamento de lotes)
// GET /api/product/lotes/
router.get('/', /* authMiddleware, */ loteProdController.listar); // Lista todos os lotes com paginação e filtros

// POST /api/product/lotes/
router.post('/', /* authMiddleware, */ loteProdController.criar);

// GET /api/product/lotes/:id
router.get('/:id', /* authMiddleware, */ loteProdController.buscarPorId);

// PUT /api/product/lotes/:id
router.put('/:id', /* authMiddleware, */ loteProdController.atualizar);

// DELETE /api/product/lotes/:id
router.delete('/:id', /* authMiddleware, */ loteProdController.excluir);

export default router;