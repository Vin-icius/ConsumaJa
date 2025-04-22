"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.CidadeController = void 0;
var cidade_create_dto_1 = require("../dtos/cidade-create.dto");
var cidade_update_dto_1 = require("../dtos/cidade-update.dto");
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var app_error_1 = require("../../common/errors/app-error");
var CidadeController = /** @class */ (function () {
    function CidadeController(cidadeService) {
        this.cidadeService = cidadeService;
        // Binding explícito dos métodos para garantir o 'this' correto
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.getByEstadoId = this.getByEstadoId.bind(this);
        this.update = this.update.bind(this);
        this["delete"] = this["delete"].bind(this);
    }
    CidadeController.prototype.create = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var createDto, errors, novaCidade, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        createDto = (0, class_transformer_1.plainToClass)(cidade_create_dto_1.CreateCidadeDto, req.body);
                        return [4 /*yield*/, (0, class_validator_1.validate)(createDto)];
                    case 1:
                        errors = _a.sent();
                        if (errors.length > 0) {
                            return [2 /*return*/, next(errors)]; // Passa erros de validação para errorHandler
                        }
                        return [4 /*yield*/, this.cidadeService.createCidade(createDto)];
                    case 2:
                        novaCidade = _a.sent();
                        res.status(201).json(novaCidade);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        next(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CidadeController.prototype.getAll = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, nome, estadoSigla, ddd, params, cidades, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, nome = _a.nome, estadoSigla = _a.estadoSigla, ddd = _a.ddd;
                        params = {
                            nome: nome,
                            estadoSigla: estadoSigla,
                            ddd: ddd
                        };
                        return [4 /*yield*/, this.cidadeService.getAllCidades(params)];
                    case 1:
                        cidades = _b.sent();
                        res.status(200).json(cidades); // Retornará [] se não houver cidades
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        next(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CidadeController.prototype.getById = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, cidade, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            throw new app_error_1.AppError('ID da cidade inválido.', 400);
                        }
                        return [4 /*yield*/, this.cidadeService.getCidadeById(id)];
                    case 1:
                        cidade = _a.sent();
                        res.status(200).json(cidade);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        next(error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CidadeController.prototype.getByEstadoId = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var estadoId, cidades, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        estadoId = parseInt(req.params.estadoId, 10);
                        if (isNaN(estadoId)) {
                            throw new app_error_1.AppError('ID do estado inválido.', 400);
                        }
                        return [4 /*yield*/, this.cidadeService.getCidadesByEstado(estadoId)];
                    case 1:
                        cidades = _a.sent();
                        res.status(200).json(cidades);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        next(error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CidadeController.prototype.update = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, updateDto, errors, cidadeAtualizada, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            throw new app_error_1.AppError('ID da cidade inválido.', 400);
                        }
                        updateDto = (0, class_transformer_1.plainToClass)(cidade_update_dto_1.UpdateCidadeDto, req.body);
                        return [4 /*yield*/, (0, class_validator_1.validate)(updateDto)];
                    case 1:
                        errors = _a.sent();
                        if (errors.length > 0) {
                            return [2 /*return*/, next(errors)];
                        }
                        if (Object.keys(updateDto).length === 0) {
                            throw new app_error_1.AppError('Nenhum dado fornecido para atualização.', 400);
                        }
                        return [4 /*yield*/, this.cidadeService.updateCidade(id, updateDto)];
                    case 2:
                        cidadeAtualizada = _a.sent();
                        res.status(200).json(cidadeAtualizada);
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        next(error_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CidadeController.prototype["delete"] = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            throw new app_error_1.AppError('ID da cidade inválido.', 400);
                        }
                        return [4 /*yield*/, this.cidadeService.deleteCidade(id)];
                    case 1:
                        _a.sent();
                        res.status(204).send();
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        next(error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CidadeController;
}());
exports.CidadeController = CidadeController;
