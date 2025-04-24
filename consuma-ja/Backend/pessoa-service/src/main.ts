import 'reflect-metadata';
import 'dotenv/config';

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Importar Rotas
import authRoutes from './interfaces/routes/auth.routes';
import pessoaRoutes from './interfaces/routes/pessoa.routes';

// Importar Middlewares e Helpers
import { errorHandler } from './interfaces/middlewares/error.middleware';
import { AppError } from './common/errors/app-error';
import { testDbConnection } from './infrastructure/database/mysql.connection';

const app: Express = express();
const port = process.env.PORT || 3002; // Ler porta do .env ou usar 3002

// --- Middlewares Essenciais ---
const corsOptions: cors.CorsOptions = { origin: process.env.CORS_ORIGIN || '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true, };
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Conexão com Banco ---
testDbConnection().catch(error => { console.error("Falha crítica DB:", error); process.exit(1); });

// --- Rotas da API ---
const apiRouter = express.Router();

// Montar rotas de autenticação
apiRouter.use('/auth', authRoutes);
apiRouter.use('/pessoa', pessoaRoutes);

// Aplicar prefixo '/api'
app.use('/api', apiRouter);

// Rota de Health Check
app.get('/health', (req: Request, res: Response) => { res.status(200).json({ status: 'OK', service: 'Pessoa Service' }); });

// --- Tratamento de Erros ---
app.use((req: Request, res: Response, next: NextFunction) => { next(new AppError(`Rota não encontrada: ${req.originalUrl}`, 404)); });
app.use(errorHandler);

// --- Iniciar o servidor ---
const server = app.listen(port, () => { console.log(`[Server] Pessoa Service rodando em http://172.20.0.13:${port}`); });