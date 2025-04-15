"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mysql_connection_1 = require("./infrastructure/database/mysql.connection");
const pessoa_mysql_repository_1 = require("./infrastructure/repositories/pessoa.mysql.repository");
const auth_service_1 = require("./application/services/auth.service");
const auth_controller_1 = require("./interfaces/controls/auth.controller");
const auth_routes_1 = require("./interfaces/routes/auth.routes");
dotenv_1.default.config();
async function bootstrap() {
    // Configuração do banco de dados
    const mysqlConnection = mysql_connection_1.MysqlConnection.getInstance();
    const pessoaRepository = new pessoa_mysql_repository_1.PessoaMysqlRepository(mysqlConnection.getPool());
    // Configuração dos serviços
    const authService = new auth_service_1.AuthService(pessoaRepository);
    // Configuração dos controllers
    const authController = new auth_controller_1.AuthController(authService);
    // Configuração do Express
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // Rotas
    app.use('/auth', (0, auth_routes_1.authRoutes)(authController));
    // Inicialização do servidor
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`Servidor de autenticação rodando na porta ${PORT}`);
    });
}
bootstrap().catch(err => {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
});
