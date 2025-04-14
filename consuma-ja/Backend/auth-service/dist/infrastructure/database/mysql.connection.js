"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlConnection = void 0;
const promise_1 = require("mysql2/promise");
class MysqlConnection {
    constructor() {
        this.pool = (0, promise_1.createPool)({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    static getInstance() {
        if (!MysqlConnection.instance) {
            MysqlConnection.instance = new MysqlConnection();
        }
        return MysqlConnection.instance;
    }
    getPool() {
        return this.pool;
    }
}
exports.MysqlConnection = MysqlConnection;
