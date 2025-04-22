"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoria_controller_1 = require("../controls/categoria.controller");
const categoria_service_1 = require("../../application/services/categoria.service");
const categoria_mysql_repository_1 = require("../../infrastructure/repositories/categoria.mysql.repository");
const router = express_1.default.Router();
const categoriaRepository = new categoria_mysql_repository_1.CategoriaMySQLRepository();
const categoriaService = new categoria_service_1.CategoriaService(categoriaRepository);
const categoriaController = new categoria_controller_1.CategoriaController(categoriaService);
router.post('/', categoriaController.criarCategoria);
router.get('/', categoriaController.listarCategorias);
router.get('/:id', categoriaController.buscarCategoriaPorId);
router.put('/:id', categoriaController.atualizarCategoria);
router.delete('/:id', categoriaController.excluirCategoria);
exports.default = router;
//# sourceMappingURL=categoria.routes.js.map