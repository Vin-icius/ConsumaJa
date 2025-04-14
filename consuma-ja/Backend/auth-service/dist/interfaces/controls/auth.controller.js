"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const login_dto_1 = require("../dtos/login.dto");
const auth_response_dto_1 = require("../dtos/auth-response.dto");
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(req, res) {
        try {
            const { login, senha } = req.body;
            const loginDTO = new login_dto_1.LoginDTO(login, senha);
            const validation = await this.authService.validateLogin(loginDTO.login, loginDTO.senha);
            if (!validation) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }
            const { pessoa, tipo } = validation;
            const token = this.authService.generateToken(pessoa);
            const response = new auth_response_dto_1.AuthResponseDTO(token, pessoa.pessoa_id, pessoa.pessoa_nome, tipo);
            return res.json(response);
        }
        catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({ message: 'Erro interno no servidor' });
        }
    }
}
exports.AuthController = AuthController;
