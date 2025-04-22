"use strict";
exports.__esModule = true;
// src/interfaces/routes/cep.routes.ts
var express_1 = require("express");
var cep_controller_1 = require("../controls/cep.controller");
var cep_service_1 = require("../../application/services/cep.service");
var estado_mysql_repository_1 = require("../../infrastructure/repositories/estado.mysql.repository");
var cidade_mysql_repository_1 = require("../../infrastructure/repositories/cidade.mysql.repository");
var via_cep_client_1 = require("../../infrastructure/clients/via-cep.client");
var router = (0, express_1.Router)();
// --- Instanciação e Injeção ---
var viaCepClient = new via_cep_client_1.ViaCepClient();
var estadoRepository = new estado_mysql_repository_1.MySQLEstadoRepository();
var cidadeRepository = new cidade_mysql_repository_1.MySQLCidadeRepository();
var cepService = new cep_service_1.CepService(viaCepClient, estadoRepository, cidadeRepository);
var cepController = new cep_controller_1.CepController(cepService);
// --- Definição da Rota ---
// GET /api/location/cep/12345678 ou GET /api/location/cep/12345-678
router.get('/cep/:cep', function (req, res, next) { return cepController.lookupCep(req, res, next); });
exports["default"] = router;
