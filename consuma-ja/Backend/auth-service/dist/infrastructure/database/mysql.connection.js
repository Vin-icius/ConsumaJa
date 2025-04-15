"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mysqlConnection = void 0;
// mysql.connection.ts
const promise_1 = __importDefault(require("mysql2/promise"));
exports.mysqlConnection = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'consumajadb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
