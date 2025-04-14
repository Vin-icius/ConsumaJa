import { Pessoa } from "./pessoa.entity";

export class Fisica {
  constructor(
    public pessoa_cpf: string,
    public pessoa_documentoValidado: boolean,
    public pessoa_fotoValidada: boolean,
    public pessoa: Pessoa
  ) {}
}