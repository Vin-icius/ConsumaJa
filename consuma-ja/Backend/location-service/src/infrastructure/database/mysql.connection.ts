// src/infrastructure/database/mysql.connection.ts

import * as mysql from 'mysql2/promise';
import { Pool, PoolOptions } from 'mysql2/promise';

// --- DEBUG ---
// Logar as variáveis de ambiente LIDOS AQUI, ANTES de criar o pool
// Isso ajuda a confirmar se o dotenv.config() em main.ts já executou
// e se as variáveis estão corretas neste ponto.
console.log('[Database Env Check] DB_HOST:', process.env.DB_HOST);
console.log('[Database Env Check] DB_USER:', process.env.DB_USER);
// IMPORTANTE: Logar a senha apenas para debug local, remova em produção!
console.log('[Database Env Check] DB_PASSWORD:', process.env.DB_PASSWORD ? '********' : '<NÃO DEFINIDO ou VAZIO>'); // Não logue a senha real! Apenas confirme se existe.
console.log('[Database Env Check] DB_NAME:', process.env.DB_NAME);
console.log('[Database Env Check] DB_CONNECTION_LIMIT:', process.env.DB_CONNECTION_LIMIT);
// --- FIM DEBUG ---


// Definir as opções do pool com tipagem (boa prática)
const poolOptions: PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Lê a senha do ambiente
  database: process.env.DB_NAME || 'ConsumaJaDB',
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Criar o pool usando a função importada
export const pool: Pool = mysql.createPool(poolOptions);

// Este log executa quando o módulo é carregado
console.log(`[Database] Attempting to create MySQL Connection Pool for database '${poolOptions.database}'...`);
// Nota: A conexão real só é testada em testDbConnection

// Opcional: Função para testar a conexão
export async function testDbConnection(): Promise<void> {
  let connection;
  try {
    // A tentativa de conexão que está falhando acontece aqui:
    connection = await pool.getConnection();
    console.log('[Database] Successfully connected to the database.');
  } catch (error: any) {
    // Log detalhado do erro que já está aparecendo
    console.error('[Database] Error connecting to the database:', error.message || error);
    // Lança o erro para ser pego pelo main.ts
    throw new Error(`Database connection failed: ${error.message}`);
  } finally {
    if (connection) {
      try {
        await connection.release();
        console.log('[Database] Test connection released.');
      } catch (releaseError: any) {
        console.error('[Database] Error releasing test connection:', releaseError.message || releaseError);
      }
    }
  }
}

// Log para indicar que este módulo foi carregado completamente
console.log("[Database] mysql.connection.ts module loaded.");