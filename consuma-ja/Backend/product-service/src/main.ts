<<<<<<< HEAD
import 'dotenv/config';
import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Importar Rotas
import produtoRoutes from './interfaces/routes/produto.routes';
import tipoRoutes from './interfaces/routes/tipo.routes';
import categoriaRoutes from './interfaces/routes/categoria.routes';
import marcaRoutes from './interfaces/routes/marca.routes';

// Importar Middlewares e Helpers
import { errorHandler } from './interfaces/middlewares/error.middleware'; // Importar o Error Handler
import { AppError } from './common/errors/app-error'; // Importar AppError para o 404 handler

const app: Express = express();
// Definir a porta a partir do ambiente ou usar 3000 como padrão
const port = process.env.PRODUCT_SERVICE_PORT || 3000;

// --- Middlewares Essenciais ---

// Configuração do CORS
const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

// Middlewares para parsear o corpo da requisição
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rotas da API ---

const apiRouter = express.Router();

apiRouter.use('/produtos', produtoRoutes);     // -> /api/product/produtos
apiRouter.use('/tipos', tipoRoutes);           // -> /api/product/tipos
apiRouter.use('/marcas', marcaRoutes);         // -> /api/product/marcas
apiRouter.use('/categorias', categoriaRoutes); // -> /api/product/categorias

// '/api/product' a todas as rotas definidas no apiRouter
app.use('/api/product', apiRouter);

// Rota de Health Check básica
app.get('/health', (req: Request, res: Response) => {
  // Poderia adicionar checagem de conexão com DB aqui se necessário
  res.status(200).json({ status: 'OK', service: 'Product Service', timestamp: new Date().toISOString() });
});


// --- Tratamento de Erros ---

// Middleware para Rotas Não Encontradas (404) - DEPOIS das rotas da API
app.use((req: Request, res: Response, next: NextFunction) => {
    // Se chegou aqui, nenhuma rota do apiRouter correspondeu
    next(new AppError(`Rota não encontrada no Product Service: ${req.originalUrl}`, 404));
});

// Middleware Global de Tratamento de Erros - DEVE SER O ÚLTIMO!
app.use(errorHandler);


// --- Iniciar o servidor ---
const server = app.listen(port, () => {
  console.log(`[Server] Product Service está rodando em http://159.112.183.233:${port}`);
  console.log(`[Server] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
=======
import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import cors from 'cors';

// Importar Rotas de cada módulo do product-service
import categoriaRoutes from './interfaces/routes/categoria.routes';
import marcaRoutes from './interfaces/routes/marca.routes';
import tipoRoutes from './interfaces/routes/tipo.routes';
import produtoRoutes from './interfaces/routes/produto.routes';
import promocaoRoutes from './interfaces/routes/promocao.routes';
import loteprodRoutes from './interfaces/routes/loteprod.routes'; // <<< IMPORTAR AS ROTAS DE LOTEPROD

import { errorHandler } from './interfaces/middlewares/error.middleware';
import { AppError } from './common/errors/app-error';
import { testDbConnection } from './infrastructure/database/mysql.connection';

const app: Express = express();
const port = process.env.PRODUCT_SERVICE_PORT || process.env.PORT || 3000;

// Middlewares Essenciais
const corsOptions: cors.CorsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Teste de Conexão com Banco (opcional, mas bom para o início)
if (process.env.NODE_ENV !== 'test') {
    testDbConnection().catch(error => {
        console.error("[Product Service] Falha crítica ao conectar ao banco de dados:", error);
        process.exit(1);
    });
}

// --- Rotas da API para Product Service ---
const apiRouter = express.Router();
apiRouter.use('/categorias', categoriaRoutes);
apiRouter.use('/marcas', marcaRoutes);
apiRouter.use('/tipos', tipoRoutes);
apiRouter.use('/produtos', produtoRoutes);
apiRouter.use('/promocoes', promocaoRoutes);
apiRouter.use('/lotes', loteprodRoutes); // <<< MONTAR AS ROTAS DE LOTEPROD AQUI

// Aplica o prefixo /api/product a todas as rotas definidas no apiRouter
app.use('/api/product', apiRouter);

// Rota de Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', service: 'Product Service', timestamp: new Date().toISOString() });
});

// --- Tratamento de Erros ---
// Handler para rotas não encontradas (deve vir depois de todas as rotas de API)
app.use((req: Request, res: Response, next: NextFunction) => {
    // Adiciona um log para ver qual rota não foi encontrada
    console.warn(`[Product Service] Rota não encontrada pelo manipulador 404: ${req.method} ${req.originalUrl}`);
    next(new AppError(`Rota não encontrada no Product Service: ${req.originalUrl}`, 404));
});

// Error Handler Global (deve ser o último middleware)
app.use(errorHandler);

// --- Iniciar o servidor ---
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`[Server] Product Service rodando na porta ${port}`);
        console.log(`[Server] Endpoints de produto: http://localhost:${port}/api/product/...`);
    });
}

export default app; // Para testes
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
