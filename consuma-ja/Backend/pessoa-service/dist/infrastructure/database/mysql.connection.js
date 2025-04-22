"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testDbConnection = testDbConnection;
const mysql = __importStar(require("mysql2/promise"));
console.log('[DB Connection - Pessoa] Lendo variáveis de ambiente:');
console.log(` > DB_HOST: ${process.env.DB_HOST}`);
console.log(` > DB_USER: ${process.env.DB_USER}`);
console.log(` > DB_PASSWORD: ${process.env.DB_PASSWORD ? '*****' : '<VAZIO/NÃO DEFINIDO>'}`); // Não loga a senha
console.log(` > DB_NAME: ${process.env.DB_NAME}`);
console.log(` > DB_CONNECTION_LIMIT: ${process.env.DB_CONNECTION_LIMIT}`);
// Definir as opções do pool lendo do process.env
const poolOptions = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ConsumaJaDB',
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 10, // Fallback 10
    queueLimit: 0,
    charset: 'utf8mb4' // Boa prática
};
// --- Criar e Exportar a Pool ---
exports.pool = mysql.createPool(poolOptions);
console.log(`[Database - Pessoa] Pool MySQL criada para DB '${poolOptions.database}' em host '${poolOptions.host}'.`);
// --- Função para Testar Conexão ---
async function testDbConnection() {
    let connection;
    console.log('[Database - Pessoa] Testando conexão com o banco de dados...');
    try {
        connection = await exports.pool.getConnection(); // Usa a pool exportada
        console.log('[Database - Pessoa] Conexão com o banco de dados bem-sucedida.');
    }
    catch (error) {
        console.error('[Database - Pessoa] ERRO AO CONECTAR COM O BANCO DE DADOS:', error.message || error);
        throw new Error(`Falha na conexão com banco de dados (Pessoa Service): ${error.message}`);
    }
    finally {
        if (connection) {
            try {
                await connection.release();
            }
            catch (releaseError) {
                console.error('[Database - Pessoa] Erro ao liberar conexão de teste:', releaseError.message || releaseError);
            }
        }
    }
}
console.log("[Database - Pessoa] Módulo mysql.connection.ts carregado.");
//# sourceMappingURL=mysql.connection.js.map