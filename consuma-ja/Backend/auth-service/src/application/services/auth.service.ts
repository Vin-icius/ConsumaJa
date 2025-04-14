import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PessoaRepository } from '../../domain/repositories/pessoa.repository';
import { Pessoa } from '../../domain/entities/pessoa.entity';
import { Fisica } from '../../domain/entities/fisica.entity';
import { Juridica } from '../../domain/entities/juridica.entity';

export class AuthService {
  constructor(private readonly pessoaRepository: PessoaRepository) {}

  private isCPF(cpf: string): boolean {
    return /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf);
  }

  private isCNPJ(cnpj: string): boolean {
    return /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(cnpj);
  }

  private isAdminLogin(login: string): boolean {
    return /^\d{3}$/.test(login);
  }

  async validateLogin(login: string, senha: string): Promise<{ pessoa: Pessoa; tipo: string } | null> {
    // Verificar se o login é CPF, CNPJ ou admin
    let pessoa: Pessoa | null = null;
    
    if (this.isCPF(login)) {
      // Buscar pessoa física por CPF
      const fisica = await this.pessoaRepository.findFisicaByPessoaId(parseInt(login.replace(/\D/g, '')));
      if (!fisica) return null;
      pessoa = fisica.pessoa;
    } else if (this.isCNPJ(login)) {
      // Buscar pessoa jurídica por CNPJ
      const juridica = await this.pessoaRepository.findJuridicaByPessoaId(parseInt(login.replace(/\D/g, '')));
      if (!juridica) return null;
      pessoa = juridica.pessoa;
    } else if (this.isAdminLogin(login)) {
      // Buscar admin pelo login (3 dígitos)
      pessoa = await this.pessoaRepository.findByLogin(login);
      if (!pessoa || pessoa.pessoa_tipo !== 'Admin') return null;
    } else {
      // Formato inválido
      return null;
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, pessoa.pessoa_senha);
    if (!senhaValida) return null;

    return { 
      pessoa,
      tipo: pessoa.pessoa_tipo
    };
  }

  generateToken(pessoa: Pessoa): string {
    const payload = {
      id: pessoa.pessoa_id,
      nome: pessoa.pessoa_nome,
      email: pessoa.pessoa_email,
      tipo: pessoa.pessoa_tipo
    };

    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '1h'
    });
  }

  async hashPassword(senha: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(senha, salt);
  }
}