import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PessoaRepository } from '../../Domain/Repositories/pessoa.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly pessoaRepo: PessoaRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(login: string, senha: string) {
    // Busca a pessoa pelo login (CPF/CNPJ ou usuário admin)
    const pessoa = await this.pessoaRepo.findByLoginOrDocumento(login);
    if (!pessoa) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    // Compara a senha inserida com a senha hash armazenada
    const senhaValida = await bcrypt.compare(senha, pessoa.pessoa_senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Senha inválida.');
    }

    // Gera o token JWT
    const payload = { id: pessoa.pessoa_id, tipo: pessoa.pessoa_tipo };
    const token = this.jwtService.sign(payload);

    return { access_token: token, tipo: pessoa.pessoa_tipo };
  }
}
