// src/domain/entities/notificacoes-preferencias.entity.ts
export interface NotificacoesPreferencias {
  notificacao_id: number;
  PESSOA_pessoa_id: number;
  email_notificacoes: boolean;
  sms_notificacoes: boolean;
  marketing_notificacoes: boolean;
  push_notificacoes: boolean;
  data_criacao: Date;
  data_atualizacao: Date;
}