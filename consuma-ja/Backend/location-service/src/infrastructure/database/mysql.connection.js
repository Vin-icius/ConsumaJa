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
exports.testDbConnection = exports.pool = void 0;
var mysql = require("mysql2/promise");
// Definir as opções do pool com tipagem (boa prática)
var poolOptions = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ConsumaJaDB',
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 10,
    queueLimit: 0,
    // Adicionar charset para suportar acentos corretamente
    charset: 'utf8mb4'
};
// Criar o pool usando a função importada
// Se usou 'import { createPool }', chame apenas 'createPool(poolOptions)'
exports.pool = mysql.createPool(poolOptions);
console.log("[Database] MySQL Connection Pool created for database '".concat(poolOptions.database, "'."));
// Opcional: Função para testar a conexão
function testDbConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, error_1, releaseError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 8]);
                    return [4 /*yield*/, exports.pool.getConnection()];
                case 1:
                    connection = _a.sent();
                    console.log('[Database] Successfully connected to the database.');
                    return [3 /*break*/, 8];
                case 2:
                    error_1 = _a.sent();
                    console.error('[Database] Error connecting to the database:', error_1.message || error_1);
                    // Considerar não sair do processo aqui, mas sim lançar um erro
                    // para que a aplicação principal decida como lidar (ex: tentar reconectar ou parar)
                    // process.exit(1);
                    throw new Error("Database connection failed: ".concat(error_1.message)); // Lança erro para a inicialização
                case 3:
                    if (!connection) return [3 /*break*/, 7];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, connection.release()];
                case 5:
                    _a.sent();
                    console.log('[Database] Test connection released.');
                    return [3 /*break*/, 7];
                case 6:
                    releaseError_1 = _a.sent();
                    console.error('[Database] Error releasing test connection:', releaseError_1.message || releaseError_1);
                    return [3 /*break*/, 7];
                case 7: return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.testDbConnection = testDbConnection;
