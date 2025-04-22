import { PessoaRepository } from "../../domain/repositories/pessoa.repository";
import { LoginDto } from "../../interfaces/dtos/login.dto";
import { AuthResponseDto } from "../../interfaces/dtos/auth-response.dto";
import { AppError } from "../../common/errors/app-error";
import { PasswordUtil } from "../../common/utils/password.util";
import { JwtUtil, JwtPayload } from "../../common/utils/jwt.util";

export class AuthService {
    constructor(private pessoaRepository: PessoaRepository) {}

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        console.log(`[AuthService] Iniciando login para: ${loginDto.login}`); // Log entrada
        try {
            // 1. Buscar usuário
            const user = await this.pessoaRepository.findByLoginOrEmailOrDoc(loginDto.login);
            console.log('[AuthService] Resultado da busca de usuário:', user ? `Encontrado ID ${user.pessoa_id}` : 'NÃO ENCONTRADO');

            // 2. Verificar se usuário existe e tem senha
            if (!user || !user.pessoa_senha) {
                console.log('[AuthService] Falha: Usuário não encontrado ou sem senha no DB.');
                throw new AppError('Login ou senha inválidos.', 401);
            }
            console.log(`[AuthService] Usuário ${user.pessoa_id} encontrado. Status: ${user.pessoa_status}`);

            // 3. Verificar se usuário está ativo (usando propriedade 'ativo' mapeada)
            if (!user.ativo) { // user.ativo é Boolean(user.pessoa_status)
                 console.log(`[AuthService] Falha: Usuário <span class="math-inline">\{user\.pessoa\_id\} está inativo \(status\=</span>{user.pessoa_status}).`);
                throw new AppError('Usuário inativo. Entre em contato com o suporte.', 403);
            }
            console.log(`[AuthService] Usuário ${user.pessoa_id} está ativo.`);

            // 4. Comparar a senha
            console.log(`[AuthService] Comparando senha para usuário ${user.pessoa_id}...`);
            const isPasswordValid = await PasswordUtil.comparePassword(loginDto.senha, user.pessoa_senha);
            console.log(`[AuthService] Resultado da comparação de senha: ${isPasswordValid}`);

            if (!isPasswordValid) {
                console.log(`[AuthService] Falha: Senha inválida para usuário ${user.pessoa_id}.`);
                throw new AppError('Login ou senha inválidos.', 401);
            }
            console.log(`[AuthService] Senha válida para usuário ${user.pessoa_id}.`);

            // 5. Gerar Payload e Token JWT
            const jwtPayload: JwtPayload = { id: user.pessoa_id, tipo: user.pessoa_tipo, email: user.pessoa_email, nome: user.pessoa_nome };
            console.log(`[AuthService] Gerando token com payload:`, jwtPayload);
            const token = JwtUtil.generateToken(jwtPayload);

            // 6. Preparar e retornar resposta
            const response: AuthResponseDto = { token, user: { id: user.pessoa_id, nome: user.pessoa_nome, email: user.pessoa_email, tipo: user.pessoa_tipo } };
            console.log(`[AuthService] Login bem-sucedido para usuário ${user.pessoa_id}.`);
            return response;

        } catch (error) {
            // Logar o erro ANTES de decidir o que fazer
             console.error("[AuthService] Erro capturado no processo de login:", error);
            // Relança AppError ou encapsula outros
            if (error instanceof AppError && (error.statusCode === 401 || error.statusCode === 403)) {
                throw error; // Relança erros de autenticação/autorização esperados
            }
            // Se não for um AppError esperado, loga como erro interno
            throw new AppError("Erro interno durante o login.", 500, false);
        }
    }
}