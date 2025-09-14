"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
// Importar Rotas de cada módulo do product-service
const avaliacao_routes_1 = __importDefault(require("./interfaces/routes/avaliacao.routes"));
const categoria_routes_1 = __importDefault(require("./interfaces/routes/categoria.routes"));
const marca_routes_1 = __importDefault(require("./interfaces/routes/marca.routes"));
const tipo_routes_1 = __importDefault(require("./interfaces/routes/tipo.routes"));
const produto_routes_1 = __importDefault(require("./interfaces/routes/produto.routes"));
const promocao_routes_1 = __importDefault(require("./interfaces/routes/promocao.routes"));
const loteprod_routes_1 = __importDefault(require("./interfaces/routes/loteprod.routes")); // <<< IMPORTAR AS ROTAS DE LOTEPROD
const error_middleware_1 = require("./interfaces/middlewares/error.middleware");
const app_error_1 = require("./common/errors/app-error");
const mysql_connection_1 = require("./infrastructure/database/mysql.connection");
const app = (0, express_1.default)();
const port = process.env.PRODUCT_SERVICE_PORT || process.env.PORT || 3000;
// Middlewares Essenciais
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Teste de Conexão com Banco (opcional, mas bom para o início)
if (process.env.NODE_ENV !== 'test') {
    (0, mysql_connection_1.testDbConnection)().catch(error => {
        console.error("[Product Service] Falha crítica ao conectar ao banco de dados:", error);
        process.exit(1);
    });
}
// --- Rotas da API para Product Service ---
const apiRouter = express_1.default.Router();
app.use('/api/product', avaliacao_routes_1.default);
apiRouter.use('/categorias', categoria_routes_1.default);
apiRouter.use('/marcas', marca_routes_1.default);
apiRouter.use('/tipos', tipo_routes_1.default);
apiRouter.use('/produtos', produto_routes_1.default);
apiRouter.use('/promocoes', promocao_routes_1.default);
apiRouter.use('/lotes', loteprod_routes_1.default); // <<< MONTAR AS ROTAS DE LOTEPROD AQUI
// Aplica o prefixo /api/product a todas as rotas definidas no apiRouter
app.use('/api/product', apiRouter);
// Rota de Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Product Service', timestamp: new Date().toISOString() });
});
// --- Tratamento de Erros ---
// Handler para rotas não encontradas (deve vir depois de todas as rotas de API)
app.use((req, res, next) => {
    // Adiciona um log para ver qual rota não foi encontrada
    console.warn(`[Product Service] Rota não encontrada pelo manipulador 404: ${req.method} ${req.originalUrl}`);
    next(new app_error_1.AppError(`Rota não encontrada no Product Service: ${req.originalUrl}`, 404));
});
// Error Handler Global (deve ser o último middleware)
app.use(error_middleware_1.errorHandler);
// --- Iniciar o servidor ---
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`[Server] Product Service rodando na porta ${port}`);
        console.log(`[Server] Endpoints de produto: http://localhost:${port}/api/product/...`);
    });
}
exports.default = app; // Para testes
//# sourceMappingURL=main.js.map