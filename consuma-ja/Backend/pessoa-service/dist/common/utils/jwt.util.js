"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtil = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const app_error_1 = require("../errors/app-error");
const jwtSecretFromEnv = process.env.JWT_SECRET;
const jwtExpiresInSeconds = process.env.JWT_EXPIRES_IN
    ? parseInt(process.env.JWT_EXPIRES_IN, 10) // Converte para número base 10
    : 3600; // Fallback para 3600 segundos (1 hora)
// ------------------------------------------------
if (!jwtSecretFromEnv) {
    console.error("JWT_SECRET não definido!");
    process.exit(1);
}
const jwtSecret = jwtSecretFromEnv;
class JwtUtil {
    static generateToken(payload) {
        const signOptions = {
            expiresIn: jwtExpiresInSeconds
            // ------------------------------------------
        };
        try {
            return jwt.sign(payload, jwtSecret, signOptions);
        }
        catch (error) {
            console.error("[JwtUtil] Erro ao gerar token:", error);
            throw new app_error_1.AppError('Erro interno ao gerar token.', 500, false);
        }
    }
    static verifyToken(token) {
        try {
            const decoded = jwt.verify(token, jwtSecret);
            if (!decoded || typeof decoded.id !== 'number' || typeof decoded.tipo !== 'string') {
                throw new app_error_1.AppError('Payload do token inválido.', 401);
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new app_error_1.AppError('Sessão expirada.', 401);
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new app_error_1.AppError('Token inválido.', 401);
            }
            console.error("[JwtUtil] Erro ao verificar token:", error);
            throw new app_error_1.AppError('Falha na autenticação.', 500, false);
        }
    }
    static generateTwoFactorToken(pessoaId, expiresInSeconds = 300) {
        try {
            const payload = { pessoaId, scope: '2fa' };
            return jwt.sign(payload, jwtSecret, { expiresIn: expiresInSeconds });
        }
        catch (error) {
            console.error('[JwtUtil] Erro ao gerar token de 2FA:', error);
            throw new app_error_1.AppError('Erro interno ao iniciar verificação 2FA.', 500, false);
        }
    }
    static verifyTwoFactorToken(token) {
        try {
            const decoded = jwt.verify(token, jwtSecret);
            if (!decoded || decoded.scope !== '2fa' || typeof decoded.pessoaId !== 'number') {
                throw new app_error_1.AppError('Token 2FA inválido.', 401);
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new app_error_1.AppError('Código 2FA expirado. Inicie o processo novamente.', 401);
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new app_error_1.AppError('Token 2FA inválido.', 401);
            }
            console.error('[JwtUtil] Erro ao validar token de 2FA:', error);
            throw new app_error_1.AppError('Falha ao validar código 2FA.', 500, false);
        }
    }
}
exports.JwtUtil = JwtUtil;
//# sourceMappingURL=jwt.util.js.map