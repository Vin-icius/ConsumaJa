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
var express = require("express");
var dotenv = require("dotenv");
var cors = require("cors");
// -------------------------------
var estado_routes_1 = require("./src/interfaces/routes/estado.routes");
var cidade_routes_1 = require("./src/interfaces/routes/cidade.routes");
var cep_routes_1 = require("./src/interfaces/routes/cep.routes");
var error_middleware_1 = require("./src/interfaces/middlewares/error.middleware");
var mysql_connection_1 = require("./src/infrastructure/database/mysql.connection");
var app_error_1 = require("./src/common/errors/app-error"); // Importar AppError para o catch do testDbConnection
// Carrega variáveis de ambiente do .env
// Nota: dotenv.config() deve ser chamado o mais cedo possível
var configResult = dotenv.config();
if (configResult.error) {
    console.warn('[dotenv] Erro ao carregar arquivo .env:', configResult.error.message);
    console.warn('[dotenv] Usando variáveis de ambiente do sistema (se definidas) ou valores padrão.');
}
var app = express(); // express() ainda funciona com import * as express
var port = process.env.PORT || 3001;
// --- Middlewares essenciais ---
// Configuração do CORS (mais flexível)
// Considere restringir a origem em produção
var corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
};
app.use(cors(corsOptions)); // cors() ainda funciona com import * as cors
app.use(express.json()); // Para parsear JSON body
app.use(express.urlencoded({ extended: true })); // Para parsear URL-encoded body
// --- Conexão com Banco e Rotas ---
// Testar conexão com o banco ao iniciar (com tratamento de erro)
(0, mysql_connection_1.testDbConnection)()["catch"](function (error) {
    console.error("[Main] Falha crítica na inicialização: Não foi possível conectar ao banco de dados.", error);
    process.exit(1); // Sair se o DB não conectar na inicialização é uma opção válida
});
// Rotas da API com prefixo
var apiRouter = express.Router(); // Usar um router para o prefixo
apiRouter.use(estado_routes_1["default"]);
apiRouter.use(cidade_routes_1["default"]);
apiRouter.use(cep_routes_1["default"]);
app.use('/api/location', apiRouter); // Aplica o prefixo a todas as rotas do apiRouter
// Rota de Health Check básica
app.get('/health', function (req, res) {
    // Verificar status do DB se possível (ex: pool.pool._acquiringConnections.length)
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
// --- Tratamento de Erros ---
// Middleware para tratar rotas não encontradas (404) - Deve vir ANTES do errorHandler
app.use(function (req, res, next) {
    next(new app_error_1.AppError("Rota n\u00E3o encontrada: ".concat(req.originalUrl), 404));
});
// Middleware global de tratamento de erros (deve ser o último)
app.use(error_middleware_1.errorHandler);
// --- Iniciar o servidor ---
var server = app.listen(port, function () {
    console.log("[Server] Location Service est\u00E1 rodando em http://localhost:".concat(port));
    console.log("[Server] Ambiente: ".concat(process.env.NODE_ENV || 'development'));
});
// --- Graceful Shutdown (Opcional, mas boa prática) ---
var signals = ['SIGINT', 'SIGTERM'];
signals.forEach(function (signal) {
    process.on(signal, function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("[Server] Recebido sinal ".concat(signal, ". Desligando..."));
            server.close(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                var pool, dbErr_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (err) {
                                console.error('[Server] Erro ao fechar servidor HTTP:', err);
                                process.exit(1);
                            }
                            console.log('[Server] Servidor HTTP fechado.');
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, 5, 6]);
                            return [4 /*yield*/, Promise.resolve().then(function () { return require('./src/infrastructure/database/mysql.connection'); })];
                        case 2:
                            pool = (_a.sent()).pool;
                            return [4 /*yield*/, pool.end()];
                        case 3:
                            _a.sent();
                            console.log('[Database] Pool de conexões MySQL fechado.');
                            return [3 /*break*/, 6];
                        case 4:
                            dbErr_1 = _a.sent();
                            console.error('[Database] Erro ao fechar pool de conexões MySQL:', dbErr_1);
                            return [3 /*break*/, 6];
                        case 5:
                            process.exit(0); // Saída limpa
                            return [7 /*endfinally*/];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
