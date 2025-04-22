"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.EstadoService = void 0;
var app_error_1 = require("../../common/errors/app-error"); // <<< Corrigido o caminho da importação
var EstadoService = /** @class */ (function () {
    // Injeção de Dependência do repositório
    function EstadoService(estadoRepository) {
        this.estadoRepository = estadoRepository;
    }
    EstadoService.prototype.getAllEstados = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var estados, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.estadoRepository.findAll(params)];
                    case 1:
                        estados = _a.sent();
                        return [2 /*return*/, estados];
                    case 2:
                        error_1 = _a.sent();
                        // Se já for um AppError lançado pelo repositório, relança ele
                        if (error_1 instanceof app_error_1.AppError) {
                            throw error_1;
                        }
                        // Se for outro tipo de erro, loga e lança um AppError genérico
                        console.error("[EstadoService.getAllEstados] Erro inesperado:", error_1);
                        throw new app_error_1.AppError("Erro ao buscar lista de estados.", 500, false);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EstadoService.prototype.getEstadoById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var estado, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.estadoRepository.findById(id)];
                    case 1:
                        estado = _a.sent();
                        if (!estado) {
                            // Erro operacional claro: estado não encontrado
                            throw new app_error_1.AppError('Estado não encontrado', 404); // 404 Not Found
                        }
                        return [2 /*return*/, estado];
                    case 2:
                        error_2 = _a.sent();
                        if (error_2 instanceof app_error_1.AppError) {
                            throw error_2;
                        } // Relança AppErrors (como o 404 acima)
                        console.error("[EstadoService.getEstadoById] Erro inesperado ao buscar estado ".concat(id, ":"), error_2);
                        throw new app_error_1.AppError("Erro ao buscar estado ".concat(id, "."), 500, false);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EstadoService.prototype.createEstado = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var siglaUpper, _a, nomeExists, siglaExists, dataToCreate, novoEstado, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Validação de formato da sigla (antes de consultar o DB)
                        if (data.estado_sigla.length < 2 || data.estado_sigla.length > 3) {
                            throw new app_error_1.AppError('Sigla do estado deve ter entre 2 e 3 caracteres.', 400); // 400 Bad Request
                        }
                        siglaUpper = data.estado_sigla.toUpperCase();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, Promise.all([
                                this.estadoRepository.findByNome(data.estado_nome),
                                this.estadoRepository.findBySigla(siglaUpper)
                            ])];
                    case 2:
                        _a = _b.sent(), nomeExists = _a[0], siglaExists = _a[1];
                        if (nomeExists) {
                            // Usar 409 Conflict faz mais sentido para recurso que já existe
                            throw new app_error_1.AppError("O nome de estado \"".concat(data.estado_nome, "\" j\u00E1 existe."), 409); // 409 Conflict
                        }
                        if (siglaExists) {
                            throw new app_error_1.AppError("A sigla de estado \"".concat(siglaUpper, "\" j\u00E1 existe."), 409); // 409 Conflict
                        }
                        dataToCreate = __assign(__assign({}, data), { estado_sigla: siglaUpper // Salva em maiúsculas
                         });
                        return [4 /*yield*/, this.estadoRepository.create(dataToCreate)];
                    case 3:
                        novoEstado = _b.sent();
                        return [2 /*return*/, novoEstado];
                    case 4:
                        error_3 = _b.sent();
                        if (error_3 instanceof app_error_1.AppError) {
                            throw error_3;
                        } // Relança AppErrors (como os 409 acima ou erros do repo)
                        console.error("[EstadoService.createEstado] Erro inesperado:", error_3);
                        // Erro não esperado durante validação ou criação
                        throw new app_error_1.AppError("Erro ao criar o estado.", 500, false);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    EstadoService.prototype.updateEstado = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var estadoExistente, dataToUpdate, siglaUpper, checks, _a, nomeConflict, siglaConflict, estadoAtualizado, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getEstadoById(id)];
                    case 1:
                        estadoExistente = _b.sent();
                        dataToUpdate = __assign({}, data);
                        siglaUpper = undefined;
                        if (dataToUpdate.estado_sigla) {
                            // Validação de formato da sigla
                            if (dataToUpdate.estado_sigla.length < 2 || dataToUpdate.estado_sigla.length > 3) {
                                throw new app_error_1.AppError('Sigla do estado deve ter entre 2 e 3 caracteres.', 400); // 400 Bad Request
                            }
                            siglaUpper = dataToUpdate.estado_sigla.toUpperCase();
                            dataToUpdate.estado_sigla = siglaUpper; // Atualiza o DTO com a sigla normalizada
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        checks = [];
                        // Verifica nome apenas se foi passado e é diferente do atual
                        if (dataToUpdate.estado_nome && dataToUpdate.estado_nome !== estadoExistente.estado_nome) {
                            checks.push(this.estadoRepository.findByNome(dataToUpdate.estado_nome));
                        }
                        else {
                            checks.push(Promise.resolve(null)); // Placeholder para manter a ordem do Promise.all
                        }
                        // Verifica sigla apenas se foi passada e é diferente da atual
                        if (siglaUpper && siglaUpper !== estadoExistente.estado_sigla) {
                            checks.push(this.estadoRepository.findBySigla(siglaUpper));
                        }
                        else {
                            checks.push(Promise.resolve(null));
                        }
                        return [4 /*yield*/, Promise.all(checks)];
                    case 3:
                        _a = _b.sent(), nomeConflict = _a[0], siglaConflict = _a[1];
                        if (nomeConflict) {
                            throw new app_error_1.AppError("O nome de estado \"".concat(dataToUpdate.estado_nome, "\" j\u00E1 pertence a outro estado (ID: ").concat(nomeConflict.estado_id, ")."), 409); // 409 Conflict
                        }
                        if (siglaConflict) {
                            throw new app_error_1.AppError("A sigla de estado \"".concat(siglaUpper, "\" j\u00E1 pertence a outro estado (ID: ").concat(siglaConflict.estado_id, ")."), 409); // 409 Conflict
                        }
                        return [4 /*yield*/, this.estadoRepository.update(id, dataToUpdate)];
                    case 4:
                        estadoAtualizado = _b.sent();
                        // O repo.update agora retorna null ou lança erro se não encontrou.
                        // Como já checamos a existência no início, um null aqui seria inesperado.
                        if (!estadoAtualizado) {
                            console.error("[EstadoService.updateEstado] Reposit\u00F3rio retornou null para estado ".concat(id, " ap\u00F3s update, mas ele existia."));
                            throw new app_error_1.AppError('Falha inesperada ao tentar atualizar o estado.', 500, false);
                        }
                        return [2 /*return*/, estadoAtualizado];
                    case 5:
                        error_4 = _b.sent();
                        if (error_4 instanceof app_error_1.AppError) {
                            throw error_4;
                        } // Relança AppErrors (404, 400, 409, ou do repo)
                        console.error("[EstadoService.updateEstado] Erro inesperado ao atualizar estado ".concat(id, ":"), error_4);
                        throw new app_error_1.AppError("Erro ao atualizar o estado ".concat(id, "."), 500, false);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    EstadoService.prototype.deleteEstado = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var deleted, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.estadoRepository["delete"](id)];
                    case 1:
                        deleted = _a.sent();
                        if (!deleted) {
                            // Se o repositório retorna false, significa que o estado não foi encontrado para deletar.
                            throw new app_error_1.AppError('Estado não encontrado para exclusão.', 404); // 404 Not Found
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        if (error_5 instanceof app_error_1.AppError) {
                            throw error_5;
                        } // Relança AppErrors (como o 404 acima, ou 409 do repo se houver FK)
                        console.error("[EstadoService.deleteEstado] Erro inesperado ao deletar estado ".concat(id, ":"), error_5);
                        throw new app_error_1.AppError("Erro ao excluir o estado ".concat(id, "."), 500, false);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return EstadoService;
}());
exports.EstadoService = EstadoService;
