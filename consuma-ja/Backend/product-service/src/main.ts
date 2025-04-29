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