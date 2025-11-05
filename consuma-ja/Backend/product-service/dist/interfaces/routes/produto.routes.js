"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const produto_controller_1 = require("../controls/produto.controller");
const produto_service_1 = require("../../application/services/produto.service");
const produto_mysql_repository_1 = require("../../infrastructure/repositories/produto.mysql.repository");
const categoria_mysql_repository_1 = require("../../infrastructure/repositories/categoria.mysql.repository");
const marca_mysql_repository_1 = require("../../infrastructure/repositories/marca.mysql.repository");
const tipo_mysql_repository_1 = require("../../infrastructure/repositories/tipo.mysql.repository");
const product_images_config_1 = require("../../config/product-images.config");
const router = express_1.default.Router();
// --- Instanciação (Idealmente usar DI) ---
const categoriaRepository = new categoria_mysql_repository_1.CategoriaMySQLRepository();
const marcaRepository = new marca_mysql_repository_1.MarcaMySQLRepository();
const tipoRepository = new tipo_mysql_repository_1.TipoMySQLRepository();
const produtoRepository = new produto_mysql_repository_1.ProdutoMySQLRepository();
const produtoService = new produto_service_1.ProdutoService(produtoRepository, categoriaRepository, marcaRepository, tipoRepository);
const produtoController = new produto_controller_1.ProdutoController(produtoService);
// --- Rotas ---
// <<< ROTAS MAIS ESPECÍFICAS PRIMEIRO >>>
router.get('/pendentes', /* authMiddleware, */ produtoController.listarPendentes);
router.get('/para-selecao-promocao', produtoController.listarParaSelecao); // Para o formulário de promoção
// ------------------------------------
// Rota de listagem geral (pode ter query params, mas não params de rota conflitantes)
router.get('/', /* authMiddleware, */ produtoController.listarProdutos);
// Rotas de criação (sem ID na URL)
router.post('/', /* authMiddleware, */ produtoController.criarProduto);
router.post('/:id/imagem', product_images_config_1.productImageUpload.single('imagem'), produtoController.uploadImagem);
// <<< ROTAS COM PARÂMETRO /:id VÊM DEPOIS DAS ESPECÍFICAS >>>
router.get('/:id', /* authMiddleware, */ produtoController.buscarProdutoPorId);
router.put('/:id', /* authMiddleware, */ produtoController.atualizarProduto);
router.delete('/:id', /* authMiddleware, */ produtoController.excluirProduto); // Exclusão lógica
router.patch('/:id/aprovar', /* authMiddleware, */ produtoController.aprovarProduto);
router.patch('/:id/rejeitar', /* authMiddleware, */ produtoController.rejeitarProduto);
// ---------------------------------------------------------
exports.default = router;
//# sourceMappingURL=produto.routes.js.map