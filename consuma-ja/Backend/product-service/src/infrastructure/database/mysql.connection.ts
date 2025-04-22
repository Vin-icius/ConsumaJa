import * as mysql from 'mysql2/promise';
import { Pool, PoolOptions } from 'mysql2/promise';

// Log para verificar se as variáveis do .env foram carregadas ANTES deste módulo
console.log('[DB Connection] Lendo variáveis de ambiente:');
console.log(` > DB_HOST: ${process.env.DB_HOST}`);
console.log(` > DB_USER: ${process.env.DB_USER}`);
console.log(` > DB_PASSWORD: ${process.env.DB_PASSWORD ? '*****' : '<VAZIO/NÃO DEFINIDO>'}`); // NÃO logue a senha real
console.log(` > DB_NAME: ${process.env.DB_NAME}`);
console.log(` > DB_CONNECTION_LIMIT: ${process.env.DB_CONNECTION_LIMIT}`);

const poolOptions: PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ConsumaJaDB',
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 10, // Fallback 10
  queueLimit: 0,
  charset: 'utf8mb4' // Boa prática
};

export const pool: Pool = mysql.createPool(poolOptions);

console.log(`[Database] Pool MySQL criada para DB '${poolOptions.database}' em host '${poolOptions.host}'.`);

// --- Função para Testar Conexão
export async function testDbConnection(): Promise<void> {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('[Database] Conexão com o banco de dados bem-sucedida.');
  } catch (error: any) {
    console.error('[Database] ERRO AO CONECTAR COM O BANCO DE DADOS:', error.message || error);
    throw new Error(`Falha na conexão com banco de dados: ${error.message}`);
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError: any) {
        console.error('[Database] Erro ao liberar conexão de teste:', releaseError.message || releaseError);
      }
    }
  }
}

console.log("[Database] Módulo mysql.connection.ts carregado.");