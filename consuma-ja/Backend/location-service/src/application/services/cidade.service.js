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
exports.CidadeService = void 0;
var app_error_1 = require("../../common/errors/app-error");
var CidadeService = /** @class */ (function () {
    function CidadeService(cidadeRepository, estadoRepository // Injetar repo de estado
    ) {
        this.cidadeRepository = cidadeRepository;
        this.estadoRepository = estadoRepository;
    }
    CidadeService.prototype.createCidade = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var estado, cidadeExistenteComNome, novaCidade, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // 1. Validar DDD (exemplo simples, ajuste conforme regra de negócio)
                        if (!data.regiao_ddd || data.regiao_ddd.length < 2 || data.regiao_ddd.length > 4) {
                            throw new app_error_1.AppError('Formato inválido para o DDD.', 400); // 400 Bad Request
                        }
                        // Validar nome (não pode ser vazio)
                        if (!data.cidade_nome || data.cidade_nome.trim() === '') {
                            throw new app_error_1.AppError('O nome da cidade não pode ser vazio.', 400); // 400 Bad Request
                        }
                        return [4 /*yield*/, this.estadoRepository.findById(data.estado_id)];
                    case 1:
                        estado = _a.sent();
                        if (!estado) {
                            // Estado referenciado não existe, erro do cliente
                            throw new app_error_1.AppError("O estado com ID ".concat(data.estado_id, " n\u00E3o foi encontrado."), 400); // 400 Bad Request
                        }
                        return [4 /*yield*/, this.cidadeRepository.findByNomeAndEstadoId(data.cidade_nome, data.estado_id)];
                    case 2:
                        cidadeExistenteComNome = _a.sent();
                        if (cidadeExistenteComNome) {
                            // Já existe uma cidade com este nome neste estado
                            throw new app_error_1.AppError("A cidade \"".concat(data.cidade_nome, "\" j\u00E1 existe no estado ").concat(estado.estado_sigla, " (ID: ").concat(data.estado_id, ")."), 409); // 409 Conflict
                        }
                        return [4 /*yield*/, this.cidadeRepository.create(data)];
                    case 3:
                        novaCidade = _a.sent();
                        return [2 /*return*/, novaCidade];
                    case 4:
                        error_1 = _a.sent();
                        if (error_1 instanceof app_error_1.AppError) {
                            throw error_1;
                        } // Relança AppErrors (400, 409, ou vindos do repo)
                        console.error("[CidadeService.createCidade] Erro inesperado:", error_1);
                        throw new app_error_1.AppError("Erro ao criar a cidade.", 500, false); // Erro genérico não operacional
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Implementação do método getAllCidades
    CidadeService.prototype.getAllCidades = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var cidades, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.cidadeRepository.findAll(params)];
                    case 1:
                        cidades = _a.sent();
                        return [2 /*return*/, cidades];
                    case 2:
                        error_2 = _a.sent();
                        if (error_2 instanceof app_error_1.AppError) {
                            throw error_2;
                        } // Relança AppError vindo do repo (ex: 500)
                        console.error("[CidadeService.getAllCidades] Erro inesperado:", error_2);
                        throw new app_error_1.AppError("Erro ao buscar lista de cidades.", 500, false);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CidadeService.prototype.deleteCidade = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var deleted, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.cidadeRepository["delete"](id)];
                    case 1:
                        deleted = _a.sent();
                        if (!deleted) {
                            // repo.delete retornou false -> cidade não foi encontrada
                            throw new app_error_1.AppError("Cidade com ID ".concat(id, " n\u00E3o encontrada para exclus\u00E3o."), 404); // 404 Not Found
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3 instanceof app_error_1.AppError) {
                            throw error_3;
                        } // Relança AppErrors (404, ou 409 do repo por FK Restrict)
                        console.error("[CidadeService.deleteCidade] Erro inesperado ao deletar cidade ".concat(id, ":"), error_3);
                        throw new app_error_1.AppError("Erro ao excluir a cidade ".concat(id, "."), 500, false);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CidadeService.prototype.getCidadeById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var cidade, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.cidadeRepository.findById(id)];
                    case 1:
                        cidade = _a.sent();
                        if (!cidade) {
                            throw new app_error_1.AppError("Cidade com ID ".concat(id, " n\u00E3o encontrada."), 404); // 404 Not Found
                        }
                        return [2 /*return*/, cidade];
                    case 2:
                        error_4 = _a.sent();
                        if (error_4 instanceof app_error_1.AppError) {
                            throw error_4;
                        } // Relança AppError (404 acima ou 500 do repo)
                        console.error("[CidadeService.getCidadeById] Erro inesperado ao buscar cidade ".concat(id, ":"), error_4);
                        throw new app_error_1.AppError("Erro ao buscar cidade ".concat(id, "."), 500, false);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CidadeService.prototype.updateCidade = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var cidadeExistente, estadoId, dataToUpdate, outraCidadeComNome, cidadeAtualizada, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getCidadeById(id)];
                    case 1:
                        cidadeExistente = _a.sent();
                        estadoId = cidadeExistente.estado_id;
                        dataToUpdate = __assign({}, data);
                        // 2. Validar campos que estão sendo atualizados (ex: DDD, nome)
                        if (dataToUpdate.regiao_ddd && (dataToUpdate.regiao_ddd.length < 2 || dataToUpdate.regiao_ddd.length > 4)) {
                            throw new app_error_1.AppError('Formato inválido para o DDD.', 400);
                        }
                        if (dataToUpdate.cidade_nome !== undefined && dataToUpdate.cidade_nome.trim() === '') {
                            throw new app_error_1.AppError('O nome da cidade não pode ser vazio.', 400);
                        }
                        if (!(dataToUpdate.cidade_nome && dataToUpdate.cidade_nome !== cidadeExistente.cidade_nome)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.cidadeRepository.findByNomeAndEstadoId(dataToUpdate.cidade_nome, estadoId)];
                    case 2:
                        outraCidadeComNome = _a.sent();
                        // Verifica se a cidade encontrada com o mesmo nome não é a própria cidade que estamos atualizando
                        if (outraCidadeComNome && outraCidadeComNome.cidade_id !== id) {
                            throw new app_error_1.AppError("O nome de cidade \"".concat(dataToUpdate.cidade_nome, "\" j\u00E1 existe no estado ID ").concat(estadoId, " (pertence \u00E0 cidade ID ").concat(outraCidadeComNome.cidade_id, ")."), 409); // 409 Conflict
                        }
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.cidadeRepository.update(id, dataToUpdate)];
                    case 4:
                        cidadeAtualizada = _a.sent();
                        // O repo.update retorna null ou lança AppError se não encontrou (404) ou deu erro (409, 500)
                        // Como getCidadeById já validou a existência, um retorno null aqui seria inesperado
                        if (!cidadeAtualizada) {
                            console.error("[CidadeService.updateCidade] Reposit\u00F3rio retornou null para cidade ".concat(id, " ap\u00F3s update, mas ela existia."));
                            throw new app_error_1.AppError('Falha inesperada ao tentar atualizar a cidade.', 500, false);
                        }
                        return [2 /*return*/, cidadeAtualizada];
                    case 5:
                        error_5 = _a.sent();
                        if (error_5 instanceof app_error_1.AppError) {
                            throw error_5;
                        } // Relança AppErrors (404, 400, 409 ou do repo)
                        console.error("[CidadeService.updateCidade] Erro inesperado ao atualizar cidade ".concat(id, ":"), error_5);
                        throw new app_error_1.AppError("Erro ao atualizar a cidade ".concat(id, "."), 500, false);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CidadeService.prototype.getCidadesByEstado = function (estadoId) {
        return __awaiter(this, void 0, void 0, function () {
            var estado, cidades, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.estadoRepository.findById(estadoId)];
                    case 1:
                        estado = _a.sent();
                        if (!estado) {
                            // Se o estado não existe, nenhuma cidade pode pertencer a ele.
                            // Lançar 404 é semanticamente correto para "recurso (estado) não encontrado".
                            throw new app_error_1.AppError("Estado com ID ".concat(estadoId, " n\u00E3o encontrado."), 404); // 404 Not Found
                        }
                        return [4 /*yield*/, this.cidadeRepository.findByEstadoId(estadoId)];
                    case 2:
                        cidades = _a.sent();
                        return [2 /*return*/, cidades];
                    case 3:
                        error_6 = _a.sent();
                        if (error_6 instanceof app_error_1.AppError) {
                            throw error_6;
                        } // Relança AppErrors (404 acima ou 500 do repo)
                        console.error("[CidadeService.getCidadesByEstado] Erro inesperado ao buscar cidades do estado ".concat(estadoId, ":"), error_6);
                        throw new app_error_1.AppError("Erro ao buscar cidades do estado ".concat(estadoId, "."), 500, false);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CidadeService;
}());
exports.CidadeService = CidadeService;
