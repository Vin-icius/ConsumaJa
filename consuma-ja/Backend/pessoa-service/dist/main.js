"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Importar Rotas
const auth_routes_1 = __importDefault(require("./interfaces/routes/auth.routes"));
const pessoa_routes_1 = __importDefault(require("./interfaces/routes/pessoa.routes"));
const config_routes_1 = __importDefault(require("./interfaces/routes/config.routes"));
const fornecedor_routes_1 = __importDefault(require("./interfaces/routes/fornecedor.routes"));
const notification_routes_1 = __importDefault(require("./interfaces/routes/notification.routes"));
// Importar Middlewares e Helpers
const error_middleware_1 = require("./interfaces/middlewares/error.middleware");
const app_error_1 = require("./common/errors/app-error");
const mysql_connection_1 = require("./infrastructure/database/mysql.connection");
const app = (0, express_1.default)();
const port = process.env.PORT || 3002;
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
(0, mysql_connection_1.testDbConnection)().catch(error => {
    console.error('Falha crítica DB:', error);
    process.exit(1);
});
const apiRouter = express_1.default.Router();
apiRouter.use('/auth', auth_routes_1.default);
apiRouter.use('/pessoa', pessoa_routes_1.default);
apiRouter.use('/config', config_routes_1.default);
apiRouter.use('/fornecedores', fornecedor_routes_1.default);
apiRouter.use('/notifications', notification_routes_1.default);
// Aplicar prefixo '/api'
app.use('/api', apiRouter);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Pessoa Service' });
});
app.use((req, res, next) => {
    next(new app_error_1.AppError(`Rota não encontrada: ${req.originalUrl}`, 404));
});
app.use(error_middleware_1.errorHandler);
const server = app.listen(port, () => {
    console.log(`[Server] Pessoa Service rodando em http://localhost:${port}`);
});
exports.default = app;
//# sourceMappingURL=main.js.map