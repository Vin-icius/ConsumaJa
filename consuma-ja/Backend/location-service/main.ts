// main.ts
import 'dotenv/config'; // <<< GARANTE QUE .ENV SEJA CARREGADO PRIMEIRO

// --- Listeners Globais de Erro para Diagnóstico ---
// Coloque isso bem no início para pegar erros que podem ocorrer cedo
process.on('unhandledRejection', (reason, promise) => {
  console.error('!!! REJEIÇÃO NÃO TRATADA !!!');
  console.error('Motivo:', reason);
  // Descomente a linha abaixo em desenvolvimento para travar e ver o stack trace completo
  // throw reason;
});

process.on('uncaughtException', (error) => {
  console.error('!!! EXCEÇÃO NÃO CAPTURADA !!!');
  console.error('Erro:', error);
  // Considerar sair do processo (process.exit(1)) em produção após logar
});
// ----------------------------------------------------

import * as express from 'express';
import { Express, Request, Response, NextFunction } from 'express';
import * as cors from 'cors';
import estadoRoutes from './src/interfaces/routes/estado.routes';
import cidadeRoutes from './src/interfaces/routes/cidade.routes';
import cepRoutes from './src/interfaces/routes/cep.routes';
import { errorHandler } from './src/interfaces/middlewares/error.middleware';
import { testDbConnection } from './src/infrastructure/database/mysql.connection';
import { AppError } from './src/common/errors/app-error';

const app: Express = express();
const port = process.env.PORT || 3001;

// --- Middlewares essenciais ---
const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Conexão com Banco e Rotas ---

// Testar conexão com o banco ao iniciar
testDbConnection().catch(error => {
    console.error("[Main] Falha crítica na inicialização: Não foi possível conectar ao banco de dados.", error);
    process.exit(1); // Sair se o DB não conectar na inicialização
});

// Rotas da API com prefixo
const apiRouter = express.Router();
apiRouter.use(estadoRoutes);
apiRouter.use(cidadeRoutes);
apiRouter.use(cepRoutes);
app.use('/api/location', apiRouter);

// Rota de Health Check básica
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Tratamento de Erros ---
// Middleware 404 (ANTES do errorHandler global)
app.use((req: Request, res: Response, next: NextFunction) => {
    // Se chegou aqui, nenhuma rota acima correspondeu
    next(new AppError(`Rota não encontrada: ${req.originalUrl}`, 404));
});

// Middleware global de tratamento de erros (ÚLTIMO middleware)
app.use(errorHandler);

// --- Iniciar o servidor ---
// Armazena a instância do servidor para poder fechá-la depois
const server = app.listen(port, () => {
  console.log(`[Server] Location Service está rodando em http://localhost:${port}`);
  console.log(`[Server] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// --- Graceful Shutdown ---
// Bloco comentado para fins de diagnóstico do TypeError no controller
/*
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

signals.forEach(signal => {
    process.on(signal, async () => {
        console.log(`[Server] Recebido sinal ${signal}. Desligando...`);
        server.close(async (err) => { // Fecha o servidor HTTP primeiro
            if (err) {
                console.error('[Server] Erro ao fechar servidor HTTP:', err);
                process.exit(1); // Saída com erro se o servidor não fechar
            }
            console.log('[Server] Servidor HTTP fechado.');

            // Tenta fechar o pool do DB *depois* que o servidor parou de aceitar conexões
            try {
                const { pool } = await import('./src/infrastructure/database/mysql.connection');
                if (pool && typeof pool.end === 'function') {
                    await pool.end();
                    console.log('[Database] Pool de conexões MySQL fechado.');
                } else {
                     console.warn('[Database] Pool de conexões não encontrado ou inválido para fechar.');
                }
            } catch (dbErr) {
                console.error('[Database] Erro ao fechar pool de conexões MySQL:', dbErr);
            } finally {
                 console.log('[Server] Desligamento concluído.');
                 process.exit(0); // Saída limpa
            }
        });

        // Força o desligamento após um tempo limite se server.close() não resolver
        setTimeout(() => {
            console.error('[Server] Desligamento forçado após timeout.');
            process.exit(1);
        }, 10000); // Timeout de 10 segundos

    });
});
*/