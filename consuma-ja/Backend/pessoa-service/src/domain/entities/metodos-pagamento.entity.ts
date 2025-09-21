// src/domain/entities/metodos-pagamento.entity.ts
export interface MetodosPagamento {
  pagamento_id: number;
  PESSOA_pessoa_id: number;
  tipo_pagamento: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | 'paypal';
  nome_titular?: string | null;
  numero_cartao?: string | null;
  data_expiracao?: string | null;
  cvv?: string | null;
  chave_pix?: string | null;
  email_paypal?: string | null;
  ativo: boolean;
  padrao: boolean;
  data_criacao: Date;
  data_atualizacao: Date;
}