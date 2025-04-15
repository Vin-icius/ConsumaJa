// mysql.connection.ts
import mysql from 'mysql2/promise';

export const mysqlConnection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'consumajadb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});