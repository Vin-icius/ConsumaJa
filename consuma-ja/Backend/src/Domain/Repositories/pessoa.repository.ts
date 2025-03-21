import { Repository } from 'typeorm';
import { Pessoa } from '../Entities/pessoa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PessoaRepository {
  constructor(
    @InjectRepository(Pessoa)
    private pessoaRepo: Repository<Pessoa>,
  ) {}

  async findByLoginOrDocumento(login: string): Promise<Pessoa | null> {
    return this.pessoaRepo.findOne({
      where: [{ pessoa_login: login }, { fisica: { pessoa_cpf: login } }, { juridica: { fornecedor_cnpj: login } }],
      relations: ['fisica', 'juridica'],
    });
  }
}
