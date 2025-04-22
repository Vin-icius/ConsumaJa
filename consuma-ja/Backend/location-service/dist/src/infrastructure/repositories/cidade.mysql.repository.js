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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.MySQLCidadeRepository = void 0;
var mysql_connection_1 = require("../database/mysql.connection"); // Certifique-se que esta importação está correta e 'pool' é o Pool do mysql2/promise
var app_error_1 = require("../../common/errors/app-error");
var MySQLCidadeRepository = /** @class */ (function () {
    function MySQLCidadeRepository() {
    }
    // mapRowToCidade (mantido)
    MySQLCidadeRepository.prototype.mapRowToCidade = function (row) {
        return {
            cidade_id: row.cidade_id,
            cidade_nome: row.cidade_nome,
            regiao_ddd: row.regiao_ddd,
            estado_id: row.ESTADO_estado_id
        };
    };
    MySQLCidadeRepository.prototype.findAll = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var sqlQuery, queryParams, rows, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sqlQuery = "\n            SELECT c.*\n            FROM CIDADE c\n            JOIN ESTADO e ON c.ESTADO_estado_id = e.estado_id\n            WHERE 1=1\n        ";
                        queryParams = [];
                        if (params === null || params === void 0 ? void 0 : params.nome) {
                            sqlQuery += ' AND c.cidade_nome LIKE ?';
                            queryParams.push("%".concat(params.nome, "%"));
                        }
                        if (params === null || params === void 0 ? void 0 : params.ddd) {
                            sqlQuery += ' AND c.regiao_ddd = ?'; // Ajustar nome da coluna se necessário
                            queryParams.push(params.ddd);
                        }
                        if (params === null || params === void 0 ? void 0 : params.estadoSigla) {
                            sqlQuery += ' AND e.estado_sigla = ?';
                            queryParams.push(params.estadoSigla);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, mysql_connection_1.pool.query(sqlQuery, queryParams)];
                    case 2:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows.map(this.mapRowToCidade)];
                    case 3:
                        error_1 = _a.sent();
                        console.error("[MySQLCidadeRepository.findAll] Erro ao buscar cidades:", error_1);
                        throw new app_error_1.AppError("Erro ao buscar cidades.", 500, false);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ... (restante dos métodos findById, findByEstadoId, etc., como no exemplo anterior) ...
    MySQLCidadeRepository.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var rows, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, mysql_connection_1.pool.query('SELECT * FROM CIDADE WHERE cidade_id = ?', [id])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows[0] ? this.mapRowToCidade(rows[0]) : null];
                    case 2:
                        error_2 = _a.sent();
                        console.error("[MySQLCidadeRepository.findById] Erro ao buscar cidade ".concat(id, ":"), error_2);
                        throw new app_error_1.AppError("Erro ao buscar cidade ".concat(id, "."), 500, false);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MySQLCidadeRepository.prototype.findByEstadoId = function (estadoId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, mysql_connection_1.pool.query('SELECT * FROM CIDADE WHERE ESTADO_estado_id = ?', [estadoId])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows.map(this.mapRowToCidade)];
                    case 2:
                        error_3 = _a.sent();
                        console.error("[MySQLCidadeRepository.findByEstadoId] Erro ao buscar cidades do estado ".concat(estadoId, ":"), error_3);
                        throw new app_error_1.AppError("Erro ao buscar cidades do estado ".concat(estadoId, "."), 500, false);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MySQLCidadeRepository.prototype.findByNomeAndEstadoId = function (nome, estadoId) {
        return __awaiter(this, void 0, void 0, function () {
            var rows, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, mysql_connection_1.pool.query('SELECT * FROM CIDADE WHERE cidade_nome = ? AND ESTADO_estado_id = ?', [nome, estadoId])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows[0] ? this.mapRowToCidade(rows[0]) : null];
                    case 2:
                        error_4 = _a.sent();
                        console.error("[MySQLCidadeRepository.findByNomeAndEstadoId] Erro ao buscar cidade \"".concat(nome, "\" no estado ").concat(estadoId, ":"), error_4);
                        throw new app_error_1.AppError("Erro ao buscar cidade \"".concat(nome, "\" no estado ").concat(estadoId, "."), 500, false);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MySQLCidadeRepository.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var cidade_nome, regiao_ddd, estado_id, insertQuery, result, insertedId, novaCidade, error_5, existente;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cidade_nome = data.cidade_nome, regiao_ddd = data.regiao_ddd, estado_id = data.estado_id;
                        insertQuery = 'INSERT INTO CIDADE (cidade_nome, regiao_ddd, ESTADO_estado_id) VALUES (?, ?, ?)';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 7]);
                        return [4 /*yield*/, mysql_connection_1.pool.query(insertQuery, [cidade_nome, regiao_ddd, estado_id])];
                    case 2:
                        result = (_a.sent())[0];
                        insertedId = result.insertId;
                        return [4 /*yield*/, this.findById(insertedId)];
                    case 3:
                        novaCidade = _a.sent();
                        if (!novaCidade) {
                            throw new app_error_1.AppError("Falha interna ao verificar cidade recém-criada.", 500, false);
                        }
                        return [2 /*return*/, novaCidade];
                    case 4:
                        error_5 = _a.sent();
                        if (!(error_5.code === 'ER_DUP_ENTRY')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.findByNomeAndEstadoId(cidade_nome, estado_id)];
                    case 5:
                        existente = _a.sent();
                        if (existente) {
                            throw new app_error_1.AppError("A cidade \"".concat(cidade_nome, "\" j\u00E1 existe no estado ID ").concat(estado_id, "."), 409);
                        }
                        else {
                            throw new app_error_1.AppError("Erro de duplica\u00E7\u00E3o ao criar cidade \"".concat(cidade_nome, "\". Verifique os dados."), 409);
                        }
                        _a.label = 6;
                    case 6:
                        if (error_5.code === 'ER_NO_REFERENCED_ROW_2') {
                            throw new app_error_1.AppError("O estado com ID ".concat(estado_id, " n\u00E3o existe."), 400);
                        }
                        console.error("[MySQLCidadeRepository.create] Erro inesperado ao criar cidade:", error_5);
                        throw new app_error_1.AppError("Erro inesperado ao salvar a cidade.", 500, false);
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    MySQLCidadeRepository.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var dataForQuery, key, fields, values, cidadeAtual, setClause, updateQuery, result, existe, cidadeAtualizada, error_6, cidadeAtual, estadoId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataForQuery = {};
                        for (key in data) {
                            dataForQuery[key] = data[key];
                        }
                        fields = Object.keys(dataForQuery);
                        values = Object.values(dataForQuery);
                        if (!(fields.length === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        cidadeAtual = _a.sent();
                        // Lança erro se não encontrar a cidade que deveria ser atualizada (ou não)
                        if (!cidadeAtual) {
                            throw new app_error_1.AppError("Cidade com ID ".concat(id, " n\u00E3o encontrada."), 404);
                        }
                        return [2 /*return*/, cidadeAtual]; // Retorna sem fazer update se não há campos
                    case 2:
                        setClause = fields.map(function (field) { return "".concat(field, " = ?"); }).join(', ');
                        updateQuery = "UPDATE CIDADE SET ".concat(setClause, " WHERE cidade_id = ?");
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 8, , 11]);
                        return [4 /*yield*/, mysql_connection_1.pool.query(updateQuery, __spreadArray(__spreadArray([], values, true), [id], false))];
                    case 4:
                        result = (_a.sent())[0];
                        if (!(result.affectedRows === 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.findById(id)];
                    case 5:
                        existe = _a.sent();
                        if (!existe) {
                            throw new app_error_1.AppError("Cidade com ID ".concat(id, " n\u00E3o encontrada para atualiza\u00E7\u00E3o."), 404);
                        }
                        else {
                            console.warn("[MySQLCidadeRepository.update] Update para cidade ".concat(id, " n\u00E3o afetou linhas."));
                            return [2 /*return*/, existe]; // Retorna a cidade como estava
                        }
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this.findById(id)];
                    case 7:
                        cidadeAtualizada = _a.sent();
                        if (!cidadeAtualizada) {
                            throw new app_error_1.AppError("Falha interna ao buscar cidade ".concat(id, " ap\u00F3s atualiza\u00E7\u00E3o."), 500, false);
                        }
                        return [2 /*return*/, cidadeAtualizada];
                    case 8:
                        error_6 = _a.sent();
                        if (!(error_6.code === 'ER_DUP_ENTRY')) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.findById(id)];
                    case 9:
                        cidadeAtual = _a.sent();
                        estadoId = cidadeAtual ? cidadeAtual.estado_id : 'desconhecido';
                        console.error("Erro de duplicação ao atualizar cidade:", error_6.message);
                        throw new app_error_1.AppError("O nome \"".concat(data.cidade_nome, "\" j\u00E1 existe para outra cidade no estado ID ").concat(estadoId, "."), 409);
                    case 10:
                        console.error("[MySQLCidadeRepository.update] Erro inesperado ao atualizar cidade ".concat(id, ":"), error_6);
                        throw new app_error_1.AppError("Erro inesperado ao atualizar a cidade ".concat(id, "."), 500, false);
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    MySQLCidadeRepository.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, mysql_connection_1.pool.query('DELETE FROM CIDADE WHERE cidade_id = ?', [id])];
                    case 1:
                        result = (_a.sent())[0];
                        if (result.affectedRows === 0) {
                            // Se não afetou linhas, a cidade não existia. Lançar 404? Ou apenas retornar false?
                            // Retornar false é mais consistente com a assinatura `Promise<boolean>` indicando sucesso/falha da operação DELEÇÃO.
                            // O serviço pode chamar findById antes se precisar diferenciar 'não encontrado' de 'falha ao deletar'.
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true]; // Deletou com sucesso
                    case 2:
                        error_7 = _a.sent();
                        if (error_7.code === 'ER_ROW_IS_REFERENCED_2') {
                            console.error("Erro ao deletar cidade ".concat(id, ": Est\u00E1 sendo referenciada."), error_7.message);
                            throw new app_error_1.AppError("N\u00E3o \u00E9 poss\u00EDvel excluir a cidade ".concat(id, ", pois est\u00E1 em uso."), 409);
                        }
                        console.error("[MySQLCidadeRepository.delete] Erro inesperado ao deletar cidade ".concat(id, ":"), error_7);
                        throw new app_error_1.AppError("Erro inesperado ao excluir a cidade ".concat(id, "."), 500, false);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MySQLCidadeRepository.prototype.findOrCreate = function (nome, ddd, estadoId) {
        return __awaiter(this, void 0, void 0, function () {
            var cidade, atualizada, updateError_1, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.findByNomeAndEstadoId(nome, estadoId)];
                    case 1:
                        cidade = _a.sent();
                        if (!cidade) return [3 /*break*/, 6];
                        if (!(cidade.regiao_ddd !== ddd)) return [3 /*break*/, 5];
                        console.warn("Cidade encontrada ".concat(nome, "/").concat(estadoId, ", mas DDD diverge: DB='").concat(cidade.regiao_ddd, "', API='").concat(ddd, "'. Atualizando."));
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.update(cidade.cidade_id, { regiao_ddd: ddd })];
                    case 3:
                        atualizada = _a.sent();
                        if (atualizada)
                            return [2 /*return*/, atualizada];
                        return [3 /*break*/, 5];
                    case 4:
                        updateError_1 = _a.sent();
                        console.error("[MySQLCidadeRepository.findOrCreate] Falha ao tentar atualizar DDD para cidade ".concat(cidade.cidade_id, ":"), updateError_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, cidade];
                    case 6:
                        console.log("Cidade ".concat(nome, " / Estado ").concat(estadoId, " n\u00E3o encontrada. Criando..."));
                        return [4 /*yield*/, this.create({ cidade_nome: nome, regiao_ddd: ddd, estado_id: estadoId })];
                    case 7: return [2 /*return*/, _a.sent()];
                    case 8:
                        error_8 = _a.sent();
                        if (error_8 instanceof app_error_1.AppError) {
                            throw error_8;
                        } // Relança AppErrors vindos do create/update
                        console.error("[MySQLCidadeRepository.findOrCreate] Erro inesperado para ".concat(nome, "/").concat(estadoId, ":"), error_8);
                        throw new app_error_1.AppError("Erro inesperado ao buscar ou criar a cidade \"".concat(nome, "\"."), 500, false);
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return MySQLCidadeRepository;
}());
exports.MySQLCidadeRepository = MySQLCidadeRepository;
