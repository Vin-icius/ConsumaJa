import { Request, Response } from 'express';
import { LoginDTO } from '../dtos/login.dto';
import { AuthResponseDTO } from '../dtos/auth-response.dto';
import { AuthService } from '../../application/services/auth.service';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response) {
    try {
      const { login, senha } = req.body;
      const loginDTO = new LoginDTO(login, senha);

      const validation = await this.authService.validateLogin(loginDTO.login, loginDTO.senha);
      if (!validation) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const { pessoa, tipo } = validation;
      const token = this.authService.generateToken(pessoa);

      const response = new AuthResponseDTO(
        token,
        pessoa.pessoa_id,
        pessoa.pessoa_nome,
        tipo
      );

      return res.json(response);
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  }
}