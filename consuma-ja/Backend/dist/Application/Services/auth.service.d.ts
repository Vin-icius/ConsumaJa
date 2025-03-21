import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PessoaRepository } from '../../Domain/Repositories/pessoa.repository';
export declare class AuthService {
    private readonly pessoaRepo;
    private readonly jwtService;
    private readonly configService;
    constructor(pessoaRepo: PessoaRepository, jwtService: JwtService, configService: ConfigService);
    login(login: string, senha: string): Promise<{
        access_token: string;
        tipo: string;
    }>;
}
