export class AuthResponseDTO {
    constructor(
      public readonly token: string,
      public readonly pessoa_id: number,
      public readonly pessoa_nome: string,
      public readonly pessoa_tipo: string
    ) {}
  }