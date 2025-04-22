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
exports.MySQLEstadoRepository = void 0;
var mysql_connection_1 = require("../database/mysql.connection");
var MySQLEstadoRepository = /** @class */ (function () {
    function MySQLEstadoRepository() {
    }
    // findAll, findById, findByNome, findBySigla (sem alterações lógicas significativas, exceto remover filtro 'ativo' se existia)
    MySQLEstadoRepository.prototype.findAll = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var query, queryParams, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = 'SELECT * FROM ESTADO WHERE 1=1';
                        queryParams = [];
                        return [4 /*yield*/, mysql_connection_1.pool.query(query, queryParams)];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    };
    MySQLEstadoRepository.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mysql_connection_1.pool.query('SELECT * FROM ESTADO WHERE estado_id = ?', [id])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    };
    MySQLEstadoRepository.prototype.findByNome = function (nome) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mysql_connection_1.pool.query('SELECT * FROM ESTADO WHERE estado_nome = ?', [nome])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    };
    MySQLEstadoRepository.prototype.findBySigla = function (sigla) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mysql_connection_1.pool.query('SELECT * FROM ESTADO WHERE estado_sigla = ?', [sigla])];
                    case 1:
                        rows = (_a.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    };
    MySQLEstadoRepository.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var estado_nome, estado_sigla, result, insertedId, novoEstado, error_1, existente, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        estado_nome = data.estado_nome, estado_sigla = data.estado_sigla;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 9]);
                        return [4 /*yield*/, mysql_connection_1.pool.query('INSERT INTO ESTADO (estado_nome, estado_sigla) VALUES (?, ?)', [estado_nome, estado_sigla])];
                    case 2:
                        result = (_b.sent())[0];
                        insertedId = result.insertId;
                        return [4 /*yield*/, this.findById(insertedId)];
                    case 3:
                        novoEstado = _b.sent();
                        if (!novoEstado) { // Checagem de segurança
                            throw new Error("Falha ao buscar estado recém-criado.");
                        }
                        return [2 /*return*/, novoEstado];
                    case 4:
                        error_1 = _b.sent();
                        if (!(error_1.code === 'ER_DUP_ENTRY')) return [3 /*break*/, 8];
                        console.error("Erro ao criar estado: Chave duplicada (nome ou sigla).", error_1.message);
                        return [4 /*yield*/, this.findByNome(estado_nome)];
                    case 5:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.findBySigla(estado_sigla)];
                    case 6:
                        _a = (_b.sent());
                        _b.label = 7;
                    case 7:
                        existente = _a;
                        if (existente)
                            return [2 /*return*/, existente];
                        throw new Error("Erro ao criar estado: Nome ou Sigla j\u00E1 existe.");
                    case 8:
                        console.error("Erro ao criar estado:", error_1);
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    MySQLEstadoRepository.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, values, setClause, query, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = Object.keys(data);
                        values = Object.values(data);
                        if (fields.length === 0) {
                            return [2 /*return*/, this.findById(id)];
                        }
                        setClause = fields.map(function (field) { return "".concat(field, " = ?"); }).join(', ');
                        query = "UPDATE ESTADO SET ".concat(setClause, " WHERE estado_id = ?");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, mysql_connection_1.pool.query(query, __spreadArray(__spreadArray([], values, true), [id], false))];
                    case 2:
                        result = (_a.sent())[0];
                        if (result.affectedRows === 0) {
                            return [2 /*return*/, null]; // Não encontrou
                        }
                        return [2 /*return*/, this.findById(id)];
                    case 3:
                        error_2 = _a.sent();
                        if (error_2.code === 'ER_DUP_ENTRY') {
                            console.error("Erro ao atualizar estado: Chave duplicada (nome ou sigla).", error_2.message);
                            throw new Error("Erro ao atualizar estado: Nome ou Sigla j\u00E1 existe.");
                        }
                        console.error("Erro ao atualizar estado:", error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MySQLEstadoRepository.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mysql_connection_1.pool.query('DELETE FROM ESTADO WHERE estado_id = ?', [id])];
                    case 1:
                        result = (_a.sent())[0];
                        return [2 /*return*/, result.affectedRows > 0];
                }
            });
        });
    };
    MySQLEstadoRepository.prototype.findOrCreate = function (sigla, nome) {
        return __awaiter(this, void 0, void 0, function () {
            var estado, atualizado, atualizado, error_3, reExistente, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.findBySigla(sigla)];
                    case 1:
                        estado = _b.sent();
                        if (!estado) return [3 /*break*/, 4];
                        if (!(estado.estado_nome !== nome)) return [3 /*break*/, 3];
                        console.warn("Estado encontrado pela sigla ".concat(sigla, ", mas nome diverge: DB='").concat(estado.estado_nome, "', API='").concat(nome, "'. Atualizando nome no DB."));
                        return [4 /*yield*/, this.update(estado.estado_id, { estado_nome: nome })];
                    case 2:
                        atualizado = _b.sent();
                        if (atualizado)
                            return [2 /*return*/, atualizado]; // Retorna o atualizado
                        // Se a atualização falhar (ex: nome duplicado), retorna o original
                        return [2 /*return*/, estado];
                    case 3: return [2 /*return*/, estado];
                    case 4: return [4 /*yield*/, this.findByNome(nome)];
                    case 5:
                        // Se não achou pela sigla, tenta pelo nome
                        estado = _b.sent();
                        if (!estado) return [3 /*break*/, 8];
                        if (!(estado.estado_sigla !== sigla)) return [3 /*break*/, 7];
                        console.warn("Estado encontrado pelo nome ".concat(nome, ", mas sigla diverge: DB='").concat(estado.estado_sigla, "', API='").concat(sigla, "'. Atualizando sigla no DB."));
                        return [4 /*yield*/, this.update(estado.estado_id, { estado_sigla: sigla })];
                    case 6:
                        atualizado = _b.sent();
                        if (atualizado)
                            return [2 /*return*/, atualizado];
                        return [2 /*return*/, estado]; // Retorna original se falhar update
                    case 7: return [2 /*return*/, estado];
                    case 8:
                        // Se não encontrou de nenhuma forma, cria
                        console.log("Estado ".concat(sigla, " - ").concat(nome, " n\u00E3o encontrado. Criando..."));
                        _b.label = 9;
                    case 9:
                        _b.trys.push([9, 11, , 16]);
                        return [4 /*yield*/, this.create({ estado_nome: nome, estado_sigla: sigla })];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11:
                        error_3 = _b.sent();
                        if (!error_3.message.includes('Nome ou Sigla já existe')) return [3 /*break*/, 15];
                        console.warn("[EstadoRepo] Race condition detectada em findOrCreate para ".concat(sigla, "/").concat(nome, ". Tentando buscar novamente."));
                        return [4 /*yield*/, this.findBySigla(sigla)];
                    case 12:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.findByNome(nome)];
                    case 13:
                        _a = (_b.sent());
                        _b.label = 14;
                    case 14:
                        reExistente = _a;
                        if (reExistente)
                            return [2 /*return*/, reExistente];
                        _b.label = 15;
                    case 15: throw error_3; // Relança o erro original ou outro
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return MySQLEstadoRepository;
}());
exports.MySQLEstadoRepository = MySQLEstadoRepository;
