import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ReclamacaoRoutes } from './interfaces/routes/reclamacao.routes';
import { pool } from './infrastructure/database/mysql.connection'; // Importar conexão

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Teste de Conexão com o Banco ---
// Isso ajuda a saber se o serviço subiu mas o banco caiu
pool.getConnection()
  .then((connection) => {
    console.log('[Order Service] Banco de dados conectado com sucesso!');
    connection.release();
  })
  .catch((err) => {
    console.error('[Order Service] FALHA CRÍTICA ao conectar no banco:', err);
  });

// --- Rotas ---
const apiRouter = express.Router();
apiRouter.use('/reclamacoes', new ReclamacaoRoutes().router);

app.use('/api/order', apiRouter);

// --- Health Check (Útil para saber se o serviço está vivo) ---
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'OK', 
        service: 'Order Service', 
        timestamp: new Date().toISOString() 
    });
});

// --- Middleware de Erro Global (Opcional, mas recomendado) ---
// Se você tiver o arquivo AppError e error.middleware no order-service, importe aqui.
// Por enquanto, vamos usar um handler simples:
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Order Service Error]', err);
    const status = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor';
    res.status(status).json({ status: 'error', message });
});

// --- Inicialização ---
app.listen(PORT, () => {
  console.log(`------------------------------------------------`);
  console.log(`Order Service rodando na porta ${PORT}`);
  console.log(`Endpoints: http://localhost:${PORT}/api/reclamacoes`);
  console.log(`------------------------------------------------`);
});