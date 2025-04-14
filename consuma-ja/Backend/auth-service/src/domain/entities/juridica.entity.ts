import { Pessoa } from "./pessoa.entity";

export class Juridica {
  constructor(
    public fornecedor_cnpj: string,
    public fornecedor_num: number,
    public pessoa: Pessoa
  ) {}
}