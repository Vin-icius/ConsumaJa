"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const app_error_1 = require("../../common/errors/app-error");
const password_util_1 = require("../../common/utils/password.util");
const jwt_util_1 = require("../../common/utils/jwt.util");
class AuthService {
    constructor(pessoaRepository, configService) {
        this.pessoaRepository = pessoaRepository;
        this.configService = configService;
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
                console.log(`[AuthService] Falha: Usuário <span class="math-inline">\{user\.pessoa\_id\} está inativo \(status\=</span>{user.pessoa_status}).`);
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
            const jwtPayload = { id: user.pessoa_id, tipo: user.pessoa_tipo, email: user.pessoa_email, nome: user.pessoa_nome };
            console.log(`[AuthService] Gerando token com payload:`, jwtPayload);
            const token = jwt_util_1.JwtUtil.generateToken(jwtPayload);
            // 6. Preparar e retornar resposta
            const response = { token, user: { id: user.pessoa_id, nome: user.pessoa_nome, email: user.pessoa_email, tipo: user.pessoa_tipo } };
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
    async loginWith2FA(loginDto) {
        console.log(`[AuthService] Iniciando login com 2FA para: ${loginDto.login}`); // Log entrada
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
            // 3. Verificar se usuário está ativo
            if (!user.ativo) {
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
            // 5. Verificar 2FA se habilitado
            if (this.configService) {
                const is2FAEnabled = await this.configService.is2FAEnabled(user.pessoa_id);
                console.log(`[AuthService] 2FA habilitado para usuário ${user.pessoa_id}: ${is2FAEnabled}`);
                if (is2FAEnabled) {
                    console.log(`[AuthService] 2FA habilitado para usuário ${user.pessoa_id}. Verificando bloqueio...`);
                    // Verificar se usuário está bloqueado por tentativas excessivas
                    const blockStatus = await this.configService.is2FABlocked(user.pessoa_id);
                    if (blockStatus.blocked) {
                        throw new app_error_1.AppError(`Conta temporariamente bloqueada devido a tentativas de 2FA falhidas. Tente novamente em ${blockStatus.minutesRemaining} minutos.`, 429);
                    }
                    // Verificar se código 2FA foi fornecido
                    if (!loginDto.codigo_2fa) {
                        console.log(`[AuthService] Falha: Código 2FA obrigatório mas não fornecido para usuário ${user.pessoa_id}.`);
                        throw new app_error_1.AppError('Código de autenticação de dois fatores é obrigatório.', 401);
                    }
                    // Validar código 2FA
                    const codigoValido = await this.configService.validarCodigo2FA(user.pessoa_id, loginDto.codigo_2fa);
                    console.log(`[AuthService] Resultado da validação 2FA: ${codigoValido}`);
                    if (!codigoValido) {
                        console.log(`[AuthService] Falha: Código 2FA inválido para usuário ${user.pessoa_id}.`);
                        throw new app_error_1.AppError('Código de autenticação de dois fatores inválido.', 401);
                    }
                    console.log(`[AuthService] Código 2FA válido para usuário ${user.pessoa_id}.`);
                }
                else {
                    console.log(`[AuthService] 2FA não habilitado para usuário ${user.pessoa_id}.`);
                }
            }
            // 6. Gerar Payload e Token JWT
            const jwtPayload = { id: user.pessoa_id, tipo: user.pessoa_tipo, email: user.pessoa_email, nome: user.pessoa_nome };
            console.log(`[AuthService] Gerando token com payload:`, jwtPayload);
            const token = jwt_util_1.JwtUtil.generateToken(jwtPayload);
            // 7. Preparar e retornar resposta
            const response = { token, user: { id: user.pessoa_id, nome: user.pessoa_nome, email: user.pessoa_email, tipo: user.pessoa_tipo } };
            console.log(`[AuthService] Login bem-sucedido para usuário ${user.pessoa_id}.`);
            return response;
        }
        catch (error) {
            // Logar o erro ANTES de decidir o que fazer
            console.error("[AuthService] Erro capturado no processo de login com 2FA:", error);
            // Relança AppError ou encapsula outros
            if (error instanceof app_error_1.AppError && (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 429)) {
                throw error; // Relança erros de autenticação/autorização esperados
            }
            // Se não for um AppError esperado, loga como erro interno
            throw new app_error_1.AppError("Erro interno durante o login.", 500, false);
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map