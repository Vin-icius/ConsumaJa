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
const router = express_1.default.Router();
const produtoRepository = new produto_mysql_repository_1.ProdutoMySQLRepository();
const categoriaRepository = new categoria_mysql_repository_1.CategoriaMySQLRepository();
const marcaRepository = new marca_mysql_repository_1.MarcaMySQLRepository();
const tipoRepository = new tipo_mysql_repository_1.TipoMySQLRepository();
const produtoService = new produto_service_1.ProdutoService(produtoRepository, categoriaRepository, marcaRepository, tipoRepository);
const produtoController = new produto_controller_1.ProdutoController(produtoService);
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
exports.default = router;
//# sourceMappingURL=produto.routes.js.map