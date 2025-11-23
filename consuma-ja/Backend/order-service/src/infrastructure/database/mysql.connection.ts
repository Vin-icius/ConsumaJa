import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sua_senha', // Configure no .env
  database: process.env.DB_NAME || 'ConsumaJaDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});