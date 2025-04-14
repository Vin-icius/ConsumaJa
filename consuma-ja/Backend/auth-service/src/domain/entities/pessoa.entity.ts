export enum PessoaTipo {
  FISICA = 'Fisica',
  JURIDICA = 'Juridica',
  ADMIN = 'Admin'
}

export class Pessoa {
  constructor(
    public pessoa_id: number,
    public pessoa_nome: string,
    public pessoa_email: string,
    public pessoa_telefone: string | null,
    public pessoa_tipo: PessoaTipo,
    public pessoa_login: string,
    public pessoa_senha: string,
    public pessoa_status: boolean,
    public data_criacao: Date | null
  ) {}
}