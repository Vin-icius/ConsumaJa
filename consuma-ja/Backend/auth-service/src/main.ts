import express from 'express';
import dotenv from 'dotenv';
import { MysqlConnection } from './infrastructure/database/mysql.connection';
import { PessoaMysqlRepository } from './infrastructure/repositories/pessoa.mysql.repository';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './interfaces/controls/auth.controller';
import { authRoutes } from './interfaces/routes/auth.routes';

dotenv.config();

async function bootstrap() {
  // Configuração do banco de dados
  const mysqlConnection = MysqlConnection.getInstance();
  const pessoaRepository = new PessoaMysqlRepository(mysqlConnection.getPool());

  // Configuração dos serviços
  const authService = new AuthService(pessoaRepository);

  // Configuração dos controllers
  const authController = new AuthController(authService);

  // Configuração do Express
  const app = express();
  app.use(express.json());

  // Rotas
  app.use('/auth', authRoutes(authController));

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