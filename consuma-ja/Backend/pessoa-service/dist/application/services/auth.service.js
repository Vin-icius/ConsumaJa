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
exports.AuthService = void 0;
const crypto_1 = require("crypto");
const app_error_1 = require("../../common/errors/app-error");
const password_util_1 = require("../../common/utils/password.util");
const jwt_util_1 = require("../../common/utils/jwt.util");
const speakeasy = __importStar(require("speakeasy"));
class AuthService {
    constructor(pessoaRepository, sessaoRepository, configRepository) {
        this.pessoaRepository = pessoaRepository;
        this.sessaoRepository = sessaoRepository;
        this.configRepository = configRepository;
    }
    calcularExpiracao() {
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + AuthService.SESSION_TTL_MINUTES);
        return expires;
    }
    mapSessaoToResponse(sessao) {
        return {
            id: sessao.sessao_id,
            expiraEm: sessao.expira_em.toISOString(),
            dadosUsuario: sessao.dados_usuario ?? {},
        };
    }
    sanitizeUserPayload(user) {
        if (!user) {
            return {};
        }
        const { pessoa_id, pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_status, data_criacao, ativo, fisica, juridica, documento, pessoa_cpf, pessoa_cnpj, pessoa_num_fornecedor, endereco, } = user;
        const safeUser = {
            id: pessoa_id,
            pessoa_id,
            pessoa_nome,
            nome: pessoa_nome,
            pessoa_email,
            email: pessoa_email,
            pessoa_telefone,
            telefone: pessoa_telefone,
            pessoa_tipo,
            tipo: pessoa_tipo,
            pessoa_login,
            pessoa_status,
            status: pessoa_status,
            ativo,
            data_criacao: data_criacao instanceof Date ? data_criacao.toISOString() : data_criacao ?? null,
            createdAt: data_criacao instanceof Date ? data_criacao.toISOString() : data_criacao ?? null,
            documento: documento ?? pessoa_cpf ?? pessoa_cnpj ?? null,
        };
        if (fisica) {
            safeUser.fisica = { ...fisica };
            safeUser.pessoa_cpf = fisica.pessoa_cpf ?? pessoa_cpf ?? null;
            safeUser.cpf = fisica.pessoa_cpf ?? pessoa_cpf ?? null;
            safeUser.pessoa_documentoValidado = fisica.pessoa_documentoValidado;
            safeUser.pessoa_fotoValidada = fisica.pessoa_fotoValidada;
            if (!safeUser.documento) {
                safeUser.documento = fisica.pessoa_cpf ?? pessoa_cpf ?? null;
            }
        }
        if (juridica) {
            safeUser.juridica = { ...juridica };
            safeUser.pessoa_cnpj = juridica.cnpj ?? pessoa_cnpj ?? null;
            safeUser.cnpj = juridica.cnpj ?? pessoa_cnpj ?? null;
            safeUser.pessoa_num_fornecedor = juridica.fornecedor_num ?? pessoa_num_fornecedor ?? null;
            safeUser.fornecedor_num = juridica.fornecedor_num ?? pessoa_num_fornecedor ?? null;
            if (!safeUser.documento) {
                safeUser.documento = juridica.cnpj ?? pessoa_cnpj ?? null;
            }
        }
        if (!safeUser.documento && (pessoa_cpf || pessoa_cnpj)) {
            safeUser.documento = pessoa_cpf ?? pessoa_cnpj ?? null;
        }
        if (endereco) {
            safeUser.endereco = {
                endereco_id: endereco.endereco_id,
                endereco_rua: endereco.endereco_rua,
                endereco_numero: endereco.endereco_numero,
                endereco_bairro: endereco.endereco_bairro,
                endereco_cep: endereco.endereco_cep,
                endereco_complemento: endereco.endereco_complemento,
                cidade_id: endereco.cidade_id,
                cidade_nome: endereco.cidade_nome ?? null,
                estado_id: endereco.estado_id ?? null,
                estado_nome: endereco.estado_nome ?? null,
                estado_sigla: endereco.estado_sigla ?? null,
            };
        }
        return safeUser;
    }
    async criarSessaoParaUsuario(user) {
        const jwtPayload = {
            id: user.pessoa_id,
            tipo: user.pessoa_tipo,
            email: user.pessoa_email,
            nome: user.pessoa_nome,
        };
        const token = jwt_util_1.JwtUtil.generateToken(jwtPayload);
        const safeUser = this.sanitizeUserPayload(user);
        const sessao = await this.sessaoRepository.criarSessao({
            sessao_id: (0, crypto_1.randomUUID)(),
            pessoa_id: user.pessoa_id,
            token,
            dados_usuario: safeUser,
            expira_em: this.calcularExpiracao(),
        });
        return {
            token,
            user: safeUser,
            session: this.mapSessaoToResponse(sessao),
            twoFactorRequired: false,
        };
    }
    async login(loginDto) {
        console.log(`[AuthService] Iniciando login para: ${loginDto.login}`); // Log entrada
        try {
            // 1. Buscar usuário
            const user = await this.pessoaRepository.findByLoginOrEmailOrDoc(loginDto.login);
            console.log('[AuthService] Resultado da busca de usuário:', user ? `Encontrado ID ${user.pessoa_id}` : 'NÃO ENCONTRADO');
            // 2. Verificar se usuário existe e tem senha
            if (!user || !user.pessoa_senha) {
                console.log('[AuthService] Falha: Usuário não encontrado ou sem senha no DB.');
                throw new app_error_1.AppError('Login ou senha inválidos.', 401);
            }
            console.log(`[AuthService] Usuário ${user.pessoa_id} encontrado. Status: ${user.pessoa_status}`);
            // 3. Verificar se usuário está ativo (usando propriedade 'ativo' mapeada)
            if (!user.ativo) { // user.ativo é Boolean(user.pessoa_status)
                console.log(`[AuthService] Falha: Usuário ${user.pessoa_id} está inativo (status=${user.pessoa_status}).`);
                throw new app_error_1.AppError('Usuário inativo. Entre em contato com o suporte.', 403);
            }
            console.log(`[AuthService] Usuário ${user.pessoa_id} está ativo.`);
            // 4. Comparar a senha
            console.log(`[AuthService] Comparando senha para usuário ${user.pessoa_id}...`);
            const isPasswordValid = await password_util_1.PasswordUtil.comparePassword(loginDto.senha, user.pessoa_senha);
            console.log(`[AuthService] Resultado da comparação de senha: ${isPasswordValid}`);
            if (!isPasswordValid) {
                console.log(`[AuthService] Falha: Senha inválida para usuário ${user.pessoa_id}.`);
                throw new app_error_1.AppError('Login ou senha inválidos.', 401);
            }
            console.log(`[AuthService] Senha válida para usuário ${user.pessoa_id}.`);
            // 5. Gerar Payload e Token JWT
            const safeUser = this.sanitizeUserPayload(user);
            const config2FA = await this.configRepository.findConfiguracao2FAByPessoaId(user.pessoa_id);
            const twoFactorActive = Boolean(config2FA?.habilitado);
            safeUser.two_fa = twoFactorActive;
            safeUser.twoFactorEnabled = twoFactorActive;
            if (config2FA && config2FA.habilitado && config2FA.codigo_2fa) {
                const now = new Date();
                if (config2FA.bloqueado_ate && config2FA.bloqueado_ate > now) {
                    const minutosRestantes = Math.ceil((config2FA.bloqueado_ate.getTime() - now.getTime()) / (1000 * 60));
                    throw new app_error_1.AppError(`2FA temporariamente bloqueado. Tente novamente em ${minutosRestantes} minuto(s).`, 423);
                }
                const twoFactorToken = jwt_util_1.JwtUtil.generateTwoFactorToken(user.pessoa_id);
                console.log(`[AuthService] Usuário ${user.pessoa_id} requer 2FA.`);
                return {
                    user: safeUser,
                    twoFactorRequired: true,
                    twoFactorToken,
                    message: 'Autenticação de dois fatores requerida.',
                };
            }
            const response = await this.criarSessaoParaUsuario(user);
            console.log(`[AuthService] Login bem-sucedido para usuário ${user.pessoa_id}.`);
            return response;
        }
        catch (error) {
            // Logar o erro ANTES de decidir o que fazer
            console.error("[AuthService] Erro capturado no processo de login:", error);
            // Relança AppError ou encapsula outros
            if (error instanceof app_error_1.AppError && (error.statusCode === 401 || error.statusCode === 403)) {
                throw error; // Relança erros de autenticação/autorização esperados
            }
            // Se não for um AppError esperado, loga como erro interno
            throw new app_error_1.AppError("Erro interno durante o login.", 500, false);
        }
    }
    async validarSessao(sessaoId) {
        const sessao = await this.sessaoRepository.encontrarSessaoPorId(sessaoId);
        if (!sessao || !sessao.ativo) {
            throw new app_error_1.AppError('Sessão inválida ou encerrada.', 401);
        }
        if (sessao.expira_em <= new Date()) {
            await this.sessaoRepository.invalidarSessao(sessao.sessao_id);
            throw new app_error_1.AppError('Sessão expirada. Faça login novamente.', 401);
        }
        await this.sessaoRepository.atualizarUltimaValidacao(sessao.sessao_id);
        return {
            valido: true,
            user: sessao.dados_usuario,
            session: this.mapSessaoToResponse(sessao),
        };
    }
    async encerrarSessao(sessaoId) {
        const sessao = await this.sessaoRepository.encontrarSessaoPorId(sessaoId);
        if (!sessao) {
            return;
        }
        await this.sessaoRepository.invalidarSessao(sessaoId);
    }
    async verificarCodigo2FA(twoFactorToken, codigo) {
        const payload = jwt_util_1.JwtUtil.verifyTwoFactorToken(twoFactorToken);
        const pessoaId = payload.pessoaId;
        const config = await this.configRepository.findConfiguracao2FAByPessoaId(pessoaId);
        if (!config || !config.habilitado || !config.codigo_2fa) {
            throw new app_error_1.AppError('2FA não está habilitado para este usuário.', 400);
        }
        if (config.bloqueado_ate && config.bloqueado_ate > new Date()) {
            throw new app_error_1.AppError('2FA temporariamente bloqueado. Aguarde alguns minutos e tente novamente.', 423);
        }
        const verificado = speakeasy.totp.verify({
            secret: config.codigo_2fa,
            encoding: 'base32',
            token: codigo,
            window: 2,
        });
        if (!verificado) {
            const tentativas = (config.tentativas_login ?? 0) + 1;
            config.tentativas_login = tentativas;
            if (tentativas >= 5) {
                config.bloqueado_ate = new Date(Date.now() + 15 * 60 * 1000);
            }
            await this.configRepository.saveConfiguracaoSeguranca(config);
            throw new app_error_1.AppError('Código 2FA inválido.', 401);
        }
        config.tentativas_login = 0;
        config.bloqueado_ate = null;
        await this.configRepository.saveConfiguracaoSeguranca(config);
        const usuario = await this.pessoaRepository.findById(pessoaId);
        if (!usuario) {
            throw new app_error_1.AppError('Usuário não encontrado para completar login.', 404);
        }
        return this.criarSessaoParaUsuario(usuario);
    }
}
exports.AuthService = AuthService;
AuthService.SESSION_TTL_MINUTES = 60 * 4; // 4 horas
//# sourceMappingURL=auth.service.js.map