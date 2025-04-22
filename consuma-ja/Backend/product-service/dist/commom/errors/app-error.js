"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message); // Chama o construtor da classe Error
        this.statusCode = statusCode;
        this.isOperational = isOperational; // Erros operacionais são "esperados" (ex: 404), outros são bugs
        // Garante que o nome da classe seja mantido
        Object.setPrototypeOf(this, new.target.prototype);
        // Captura o stack trace (útil para debugging no backend)
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=app-error.js.map