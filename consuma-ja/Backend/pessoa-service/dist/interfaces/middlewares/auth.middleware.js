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
        req.user = decodedPayload;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map