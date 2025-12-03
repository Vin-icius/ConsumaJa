import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../common/errors/app-error';
import { JwtPayload, JwtUtil } from '../../common/utils/jwt.util';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token de autenticação não fornecido.', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = JwtUtil.verifyToken(token);
    return next();
  } catch (error) {
    return next(error);
  }
};
