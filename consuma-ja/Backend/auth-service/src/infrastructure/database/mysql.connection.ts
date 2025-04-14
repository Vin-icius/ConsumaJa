import { Pool } from 'mysql2/promise';
import { createPool } from 'mysql2/promise';

export class MysqlConnection {
  private static instance: MysqlConnection;
  private pool: Pool;

  private constructor() {
    this.pool = createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  public static getInstance(): MysqlConnection {
    if (!MysqlConnection.instance) {
      MysqlConnection.instance = new MysqlConnection();
    }
    return MysqlConnection.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }
}