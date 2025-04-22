"use strict";
exports.__esModule = true;
// src/interfaces/routes/cidade.routes.ts
var express_1 = require("express");
var cidade_controller_1 = require("../controls/cidade.controller");
var cidade_service_1 = require("../../application/services/cidade.service");
var cidade_mysql_repository_1 = require("../../infrastructure/repositories/cidade.mysql.repository");
var estado_mysql_repository_1 = require("../../infrastructure/repositories/estado.mysql.repository"); // Precisa do repo de estado
var router = (0, express_1.Router)();
// --- Instanciação e Injeção ---
var cidadeRepository = new cidade_mysql_repository_1.MySQLCidadeRepository();
var estadoRepository = new estado_mysql_repository_1.MySQLEstadoRepository(); // Instanciar repo de estado
var cidadeService = new cidade_service_1.CidadeService(cidadeRepository, estadoRepository); // Injetar ambos
var cidadeController = new cidade_controller_1.CidadeController(cidadeService);
// --- Rotas ---
router.post('/cidades', cidadeController.create); // POST /api/location/cidades
router.get('/cidades', cidadeController.getAll); // GET /api/location/cidades?nome=...
router.get('/estados/:estadoId/cidades', cidadeController.getByEstadoId); // GET /api/location/estados/35/cidades
// Rotas com ID simples da cidade
router.get('/cidades/:id', cidadeController.getById); // GET /api/location/cidades/5022
router.put('/cidades/:id', cidadeController.update); // PUT /api/location/cidades/5022
router["delete"]('/cidades/:id', cidadeController["delete"]); // DELETE /api/location/cidades/5022
exports["default"] = router;
