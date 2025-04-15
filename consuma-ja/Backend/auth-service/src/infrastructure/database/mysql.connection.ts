import { Pool } from 'mysql2/promise';
import { createPool } from 'mysql2/promise';

export class MysqlConnection {
  private static instance: MysqlConnection;
  private pool: Pool;

  private constructor() {
    this.pool = createPool({
      host: process.env.DB_HOST,
      user: "root",
      password: "LeonEGe.11082023",
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