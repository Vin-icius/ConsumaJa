"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Importar Rotas
const produto_routes_1 = __importDefault(require("./interfaces/routes/produto.routes"));
const tipo_routes_1 = __importDefault(require("./interfaces/routes/tipo.routes"));
const categoria_routes_1 = __importDefault(require("./interfaces/routes/categoria.routes"));
const marca_routes_1 = __importDefault(require("./interfaces/routes/marca.routes"));
// Importar Middlewares e Helpers
const error_middleware_1 = require("./interfaces/middlewares/error.middleware"); // Importar o Error Handler
const app_error_1 = require("./common/errors/app-error"); // Importar AppError para o 404 handler
const app = (0, express_1.default)();
// Definir a porta a partir do ambiente ou usar 3000 como padrão
const port = process.env.PRODUCT_SERVICE_PORT || 3000;
// --- Middlewares Essenciais ---
// Configuração do CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// Middlewares para parsear o corpo da requisição
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// --- Rotas da API ---
const apiRouter = express_1.default.Router();
apiRouter.use('/produtos', produto_routes_1.default); // -> /api/product/produtos
apiRouter.use('/tipos', tipo_routes_1.default); // -> /api/product/tipos
apiRouter.use('/marcas', marca_routes_1.default); // -> /api/product/marcas
apiRouter.use('/categorias', categoria_routes_1.default); // -> /api/product/categorias
// '/api/product' a todas as rotas definidas no apiRouter
app.use('/api/product', apiRouter);
// Rota de Health Check básica
app.get('/health', (req, res) => {
    // Poderia adicionar checagem de conexão com DB aqui se necessário
    res.status(200).json({ status: 'OK', service: 'Product Service', timestamp: new Date().toISOString() });
});
// --- Tratamento de Erros ---
// Middleware para Rotas Não Encontradas (404) - DEPOIS das rotas da API
app.use((req, res, next) => {
    // Se chegou aqui, nenhuma rota do apiRouter correspondeu
    next(new app_error_1.AppError(`Rota não encontrada no Product Service: ${req.originalUrl}`, 404));
});
// Middleware Global de Tratamento de Erros - DEVE SER O ÚLTIMO!
app.use(error_middleware_1.errorHandler);
// --- Iniciar o servidor ---
const server = app.listen(port, () => {
    console.log(`[Server] Product Service está rodando em http://172.20.0.13:${port}`);
    console.log(`[Server] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
//# sourceMappingURL=main.js.map