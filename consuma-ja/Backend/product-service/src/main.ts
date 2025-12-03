import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import cors from 'cors';

// Importar Rotas de cada módulo do product-service
import avaliacaoRoutes from './interfaces/routes/avaliacao.routes';
import perguntaRoutes from './interfaces/routes/pergunta.routes'; 
import categoriaRoutes from './interfaces/routes/categoria.routes';
import marcaRoutes from './interfaces/routes/marca.routes';
import tipoRoutes from './interfaces/routes/tipo.routes';
import produtoRoutes from './interfaces/routes/produto.routes';
import promocaoRoutes from './interfaces/routes/promocao.routes';
import loteprodRoutes from './interfaces/routes/loteprod.routes'; // <<< IMPORTAR AS ROTAS DE LOTEPROD
import shoppingCartRoutes from './interfaces/routes/shopping-cart.routes';
import orderRoutes from './interfaces/routes/order.routes';
import { resolveProductImageDir, PRODUCT_IMAGE_STATIC_ROUTE } from './common/utils/image-url';

import { errorHandler } from './interfaces/middlewares/error.middleware';
import { AppError } from './common/errors/app-error';
import { testDbConnection } from './infrastructure/database/mysql.connection';

const app: Express = express();
const port = process.env.PRODUCT_SERVICE_PORT || process.env.PORT || 3000;
const productImagesDir = resolveProductImageDir();

// Middlewares Essenciais
const corsOptions: cors.CorsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(PRODUCT_IMAGE_STATIC_ROUTE, express.static(productImagesDir));

// Teste de Conexão com Banco (opcional, mas bom para o início)
if (process.env.NODE_ENV !== 'test') {
    testDbConnection().catch(error => {
        console.error("[Product Service] Falha crítica ao conectar ao banco de dados:", error);
        process.exit(1);
    });
}

// --- Rotas da API para Product Service ---
const apiRouter = express.Router();
apiRouter.use('/perguntas', perguntaRoutes);
apiRouter.use('/avaliacoes', avaliacaoRoutes);
apiRouter.use('/categorias', categoriaRoutes);
apiRouter.use('/marcas', marcaRoutes);
apiRouter.use('/tipos', tipoRoutes);
apiRouter.use('/produtos', produtoRoutes);
apiRouter.use('/promocoes', promocaoRoutes);
apiRouter.use('/lotes', loteprodRoutes); // <<< MONTAR AS ROTAS DE LOTEPROD AQUI
apiRouter.use('/cart', shoppingCartRoutes);
apiRouter.use('/orders', orderRoutes);
// Temporarily expose order routes without the /orders prefix for legacy clients still calling /api/product/<route>
apiRouter.use(orderRoutes);

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