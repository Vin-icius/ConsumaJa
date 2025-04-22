"use strict";
exports.__esModule = true;
// main.ts
require("dotenv/config"); // <<< GARANTE QUE .ENV SEJA CARREGADO PRIMEIRO
// --- Listeners Globais de Erro para Diagnóstico ---
// Coloque isso bem no início para pegar erros que podem ocorrer cedo
process.on('unhandledRejection', function (reason, promise) {
    console.error('!!! REJEIÇÃO NÃO TRATADA !!!');
    console.error('Motivo:', reason);
    // Descomente a linha abaixo em desenvolvimento para travar e ver o stack trace completo
    // throw reason;
});
process.on('uncaughtException', function (error) {
    console.error('!!! EXCEÇÃO NÃO CAPTURADA !!!');
    console.error('Erro:', error);
    // Considerar sair do processo (process.exit(1)) em produção após logar
});
// ----------------------------------------------------
var express = require("express");
var cors = require("cors");
var estado_routes_1 = require("./src/interfaces/routes/estado.routes");
var cidade_routes_1 = require("./src/interfaces/routes/cidade.routes");
var cep_routes_1 = require("./src/interfaces/routes/cep.routes");
var error_middleware_1 = require("./src/interfaces/middlewares/error.middleware");
var mysql_connection_1 = require("./src/infrastructure/database/mysql.connection");
var app_error_1 = require("./src/common/errors/app-error");
var app = express();
var port = process.env.PORT || 3001;
// --- Middlewares essenciais ---
var corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// --- Conexão com Banco e Rotas ---
// Testar conexão com o banco ao iniciar
(0, mysql_connection_1.testDbConnection)()["catch"](function (error) {
    console.error("[Main] Falha crítica na inicialização: Não foi possível conectar ao banco de dados.", error);
    process.exit(1); // Sair se o DB não conectar na inicialização
});
// Rotas da API com prefixo
var apiRouter = express.Router();
apiRouter.use(estado_routes_1["default"]);
apiRouter.use(cidade_routes_1["default"]);
apiRouter.use(cep_routes_1["default"]);
app.use('/api/location', apiRouter);
// Rota de Health Check básica
app.get('/health', function (req, res) {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
// --- Tratamento de Erros ---
// Middleware 404 (ANTES do errorHandler global)
app.use(function (req, res, next) {
    // Se chegou aqui, nenhuma rota acima correspondeu
    next(new app_error_1.AppError("Rota n\u00E3o encontrada: ".concat(req.originalUrl), 404));
});
// Middleware global de tratamento de erros (ÚLTIMO middleware)
app.use(error_middleware_1.errorHandler);
// --- Iniciar o servidor ---
// Armazena a instância do servidor para poder fechá-la depois
var server = app.listen(port, function () {
    console.log("[Server] Location Service est\u00E1 rodando em http://localhost:".concat(port));
    console.log("[Server] Ambiente: ".concat(process.env.NODE_ENV || 'development'));
});
// --- Graceful Shutdown ---
// Bloco comentado para fins de diagnóstico do TypeError no controller
/*
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

signals.forEach(signal => {
    process.on(signal, async () => {
        console.log(`[Server] Recebido sinal ${signal}. Desligando...`);
        server.close(async (err) => { // Fecha o servidor HTTP primeiro
            if (err) {
                console.error('[Server] Erro ao fechar servidor HTTP:', err);
                process.exit(1); // Saída com erro se o servidor não fechar
            }
            console.log('[Server] Servidor HTTP fechado.');

            // Tenta fechar o pool do DB *depois* que o servidor parou de aceitar conexões
            try {
                const { pool } = await import('./src/infrastructure/database/mysql.connection');
                if (pool && typeof pool.end === 'function') {
                    await pool.end();
                    console.log('[Database] Pool de conexões MySQL fechado.');
                } else {
                     console.warn('[Database] Pool de conexões não encontrado ou inválido para fechar.');
                }
            } catch (dbErr) {
                console.error('[Database] Erro ao fechar pool de conexões MySQL:', dbErr);
            } finally {
                 console.log('[Server] Desligamento concluído.');
                 process.exit(0); // Saída limpa
            }
        });

        // Força o desligamento após um tempo limite se server.close() não resolver
        setTimeout(() => {
            console.error('[Server] Desligamento forçado após timeout.');
            process.exit(1);
        }, 10000); // Timeout de 10 segundos

    });
});
*/ 
