// src/domain/entities/historico-pagamentos.entity.ts
export interface HistoricoPagamentos {
  historico_id: number;
  PESSOA_pessoa_id: number;
  METODOS_PAGAMENTO_pagamento_id?: number | null;
  VENDA_venda_id?: number | null;
  tipo_transacao: 'compra' | 'reembolso' | 'estorno';
  valor: number;
  moeda: string;
  status: 'pendente' | 'aprovado' | 'recusado' | 'cancelado' | 'reembolsado';
  gateway_transacao_id?: string | null;
  descricao?: string | null;
  data_transacao: Date;
  data_criacao: Date;
}