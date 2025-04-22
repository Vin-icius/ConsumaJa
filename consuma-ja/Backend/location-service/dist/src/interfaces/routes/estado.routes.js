"use strict";
exports.__esModule = true;
var express_1 = require("express");
var estado_controller_1 = require("../controls/estado.controller");
var estado_service_1 = require("../../application/services/estado.service");
var estado_mysql_repository_1 = require("../../infrastructure/repositories/estado.mysql.repository");
var router = (0, express_1.Router)();
// --- Instanciação e Injeção de Dependências ---
// Idealmente, usar um container de injeção de dependência (ex: InversifyJS, Tsyringe)
var estadoRepository = new estado_mysql_repository_1.MySQLEstadoRepository();
var estadoService = new estado_service_1.EstadoService(estadoRepository);
var estadoController = new estado_controller_1.EstadoController(estadoService);
router.post('/estados', function (req, res, next) { return estadoController.create(req, res, next); });
router.get('/estados', function (req, res, next) { return estadoController.getAll(req, res, next); });
router.get('/estados/:id', function (req, res, next) { return estadoController.getById(req, res, next); });
router.put('/estados/:id', function (req, res, next) { return estadoController.update(req, res, next); }); // Ou PATCH
router["delete"]('/estados/:id', function (req, res, next) { return estadoController["delete"](req, res, next); });
exports["default"] = router;
