export interface SessaoUsuario {
  sessao_id: string;
  pessoa_id: number;
  token: string;
  dados_usuario: Record<string, unknown>;
  ativo: boolean;
  data_criacao: Date;
  ultima_validacao: Date;
  expira_em: Date;
}

export interface SessaoUsuarioCreate {
  sessao_id: string;
  pessoa_id: number;
  token: string;
  dados_usuario: Record<string, unknown>;
  expira_em: Date;
}
