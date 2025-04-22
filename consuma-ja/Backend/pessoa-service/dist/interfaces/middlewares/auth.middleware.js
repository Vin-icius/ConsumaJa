"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const app_error_1 = require("../../common/errors/app-error");
const jwt_util_1 = require("../../common/utils/jwt.util");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new app_error_1.AppError('Token de autenticação não fornecido ou mal formatado.', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decodedPayload = jwt_util_1.JwtUtil.verifyToken(token);
        // Anexa os dados do usuário decodificados ao objeto 'req'
        req.user = decodedPayload;
        next(); // Prossegue para a próxima rota/middleware
    }
    catch (error) {
        // Erros do JwtUtil (TokenExpiredError, JsonWebTokenError) já são AppError 401
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map