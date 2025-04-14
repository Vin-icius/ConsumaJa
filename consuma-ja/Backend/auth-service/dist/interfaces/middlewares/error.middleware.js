"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
function errorMiddleware(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro interno no servidor' });
}
