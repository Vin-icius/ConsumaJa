import * as jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import { AppError } from '../errors/app-error';

export interface JwtPayload { id: number; tipo: string; email?: string; nome?: string; }

const jwtSecretFromEnv = process.env.JWT_SECRET;
const jwtExpiresInSeconds: number = process.env.JWT_EXPIRES_IN
                                  ? parseInt(process.env.JWT_EXPIRES_IN, 10) // Converte para número base 10
                                  : 3600; // Fallback para 3600 segundos (1 hora)
// ------------------------------------------------

if (!jwtSecretFromEnv) {
    console.error("JWT_SECRET não definido!"); process.exit(1);
}
const jwtSecret: Secret = jwtSecretFromEnv;

export class JwtUtil {

    static generateToken(payload: JwtPayload): string {
        const signOptions: SignOptions = {
            expiresIn: jwtExpiresInSeconds
            // ------------------------------------------
        };

        try {
            return jwt.sign(payload, jwtSecret, signOptions);
        } catch (error: any) {
            console.error("[JwtUtil] Erro ao gerar token:", error);
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
        } catch (error: any) {
            if (error instanceof jwt.TokenExpiredError) { throw new AppError('Sessão expirada.', 401); }
            if (error instanceof jwt.JsonWebTokenError) { throw new AppError('Token inválido.', 401); }
            console.error("[JwtUtil] Erro ao verificar token:", error);
            throw new AppError('Falha na autenticação.', 500, false);
        }
    }
}