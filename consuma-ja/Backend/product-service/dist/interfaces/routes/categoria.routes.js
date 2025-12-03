"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoria_controller_1 = require("../controls/categoria.controller");
const categoria_service_1 = require("../../application/services/categoria.service");
const categoria_mysql_repository_1 = require("../../infrastructure/repositories/categoria.mysql.repository");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const categoriaRepository = new categoria_mysql_repository_1.CategoriaMySQLRepository();
const categoriaService = new categoria_service_1.CategoriaService(categoriaRepository);
const categoriaController = new categoria_controller_1.CategoriaController(categoriaService);
router.post('/', auth_middleware_1.authMiddleware, categoriaController.criarCategoria);
router.get('/', categoriaController.listarCategorias);
router.get('/:id', categoriaController.buscarCategoriaPorId);
router.put('/:id', auth_middleware_1.authMiddleware, categoriaController.atualizarCategoria);
router.delete('/:id', auth_middleware_1.authMiddleware, categoriaController.excluirCategoria);
exports.default = router;
//# sourceMappingURL=categoria.routes.js.map