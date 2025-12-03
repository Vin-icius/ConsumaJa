"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tipo_controller_1 = require("../controls/tipo.controller");
const tipo_service_1 = require("../../application/services/tipo.service");
const tipo_mysql_repository_1 = require("../../infrastructure/repositories/tipo.mysql.repository");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const tipoController = new tipo_controller_1.TipoController(new tipo_service_1.TipoService(new tipo_mysql_repository_1.TipoMySQLRepository()));
router.post('/', auth_middleware_1.authMiddleware, tipoController.criarTipo.bind(tipoController));
router.get('/', tipoController.listarTipos.bind(tipoController));
router.get('/:id', tipoController.buscarTipoPorId.bind(tipoController));
router.put('/:id', auth_middleware_1.authMiddleware, tipoController.atualizarTipo.bind(tipoController));
router.delete('/:id', auth_middleware_1.authMiddleware, tipoController.excluirTipo.bind(tipoController));
exports.default = router;
//# sourceMappingURL=tipo.routes.js.map