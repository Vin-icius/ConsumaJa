import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../common/errors/app-error';
import { JwtUtil, JwtPayload } from '../../common/utils/jwt.util';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Token de autenticação não fornecido ou mal formatado.', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedPayload = JwtUtil.verifyToken(token);
        req.user = decodedPayload;
        next();
    } catch (error) {
        next(error);
    }
};