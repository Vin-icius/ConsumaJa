"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const marca_controller_1 = require("../controls/marca.controller");
const marca_service_1 = require("../../application/services/marca.service");
const marca_mysql_repository_1 = require("../../infrastructure/repositories/marca.mysql.repository");
const router = express_1.default.Router();
// Instanciação
const marcaRepository = new marca_mysql_repository_1.MarcaMySQLRepository();
const marcaService = new marca_service_1.MarcaService(marcaRepository);
const marcaController = new marca_controller_1.MarcaController(marcaService);
// Rotas
router.post('/', marcaController.criarMarca);
router.get('/', marcaController.listarMarcas);
router.get('/:id', marcaController.buscarMarcaPorId);
router.put('/:id', marcaController.atualizarMarca);
router.delete('/:id', marcaController.excluirMarca);
exports.default = router;
//# sourceMappingURL=marca.routes.js.map