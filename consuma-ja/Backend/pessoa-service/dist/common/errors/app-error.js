"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    /**
     * Cria uma instância de AppError.
     * @param message Mensagem descritiva do erro.
     * @param statusCode Código de status HTTP (ex: 400, 404, 401, 409, 500).
     * @param isOperational Define se o erro é operacional (true) ou um erro inesperado/bug (false). Default é true.
     */
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=app-error.js.map