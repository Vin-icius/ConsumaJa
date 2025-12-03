import * as jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import { AppError } from '../errors/app-error';

export interface JwtPayload {
  id: number;
  tipo: string;
  email?: string;
  nome?: string;
}

const jwtSecretFromEnv = process.env.JWT_SECRET;
const jwtExpiresInSeconds = process.env.JWT_EXPIRES_IN
  ? parseInt(process.env.JWT_EXPIRES_IN, 10)
  : 3600;

if (!jwtSecretFromEnv) {
  console.error('[JwtUtil] JWT_SECRET não definido nas variáveis de ambiente.');
  throw new AppError('Configuração JWT ausente.', 500, false);
}

const jwtSecret: Secret = jwtSecretFromEnv;

export class JwtUtil {
  static generateToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: jwtExpiresInSeconds };
    try {
      return jwt.sign(payload, jwtSecret, options);
    } catch (error) {
      console.error('[JwtUtil] Falha ao gerar token:', error);
      throw new AppError('Erro interno ao gerar token.', 500, false);
    }
  }

  static verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      if (!decoded || typeof decoded.id !== 'number' || typeof decoded.tipo !== 'string') {
        throw new AppError('Payload do token inválido.', 401);
      }
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Sessão expirada.', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Token inválido.', 401);
      }
      console.error('[JwtUtil] Falha ao verificar token:', error);
      throw new AppError('Falha na autenticação.', 500, false);
    }
  }
}
