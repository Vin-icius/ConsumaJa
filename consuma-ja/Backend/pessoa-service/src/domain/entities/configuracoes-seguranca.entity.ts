// src/domain/entities/configuracoes-seguranca.entity.ts
export interface ConfiguracoesSeguranca {
  seguranca_id: number;
  PESSOA_pessoa_id: number;
  autenticacao_2fa: boolean;
  codigo_2fa?: string | null;
  tentativas_login: number;
  bloqueado_ate?: Date | null;
  ultima_alteracao_senha?: Date | null;
  senha_temporaria: boolean;
  data_criacao: Date;
  data_atualizacao: Date;
}