import { Pessoa } from "../entities/pessoa.entity";
import { Fisica } from "../entities/fisica.entity";
import { Juridica } from "../entities/juridica.entity";

export interface PessoaRepository {
  findByLogin(login: string): Promise<Pessoa | null>;
  findFisicaByPessoaId(pessoaId: number): Promise<Fisica | null>;
  findJuridicaByPessoaId(pessoaId: number): Promise<Juridica | null>;
}