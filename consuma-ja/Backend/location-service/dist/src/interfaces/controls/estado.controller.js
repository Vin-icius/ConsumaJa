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
exports.EstadoController = void 0;
var EstadoController = /** @class */ (function () {
    // Injeção de Dependência do serviço
    function EstadoController(estadoService) {
        this.estadoService = estadoService;
    }
    // --- Métodos do Controller ---
    EstadoController.prototype.create = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var createDto, novoEstado, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        createDto = req.body;
                        return [4 /*yield*/, this.estadoService.createEstado(createDto)];
                    case 1:
                        novoEstado = _a.sent();
                        res.status(201).json(novoEstado);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        next(error_1); // Passa para o middleware de erro
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EstadoController.prototype.getAll = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, nome, sigla, params, estados, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, nome = _a.nome, sigla = _a.sigla;
                        params = {
                            nome: nome,
                            sigla: sigla
                        };
                        return [4 /*yield*/, this.estadoService.getAllEstados(params)];
                    case 1:
                        estados = _b.sent();
                        res.status(200).json(estados);
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
    EstadoController.prototype.getById = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, estado, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido.' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.estadoService.getEstadoById(id)];
                    case 1:
                        estado = _a.sent();
                        res.status(200).json(estado);
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
    EstadoController.prototype.update = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, updateDto, estadoAtualizado, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido.' });
                            return [2 /*return*/];
                        }
                        updateDto = req.body;
                        if (Object.keys(updateDto).length === 0) {
                            res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.estadoService.updateEstado(id, updateDto)];
                    case 1:
                        estadoAtualizado = _a.sent();
                        res.status(200).json(estadoAtualizado);
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
    EstadoController.prototype["delete"] = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido.' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.estadoService.deleteEstado(id)];
                    case 1:
                        _a.sent();
                        res.status(204).send(); // No Content
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        next(error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return EstadoController;
}());
exports.EstadoController = EstadoController;
