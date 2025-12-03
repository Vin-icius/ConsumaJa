export interface ItemVenda {
  lote_id: number;
  quantidade: number;
  valor_unitario: number;
  promocao_id: number;
}

export interface Venda {
  venda_id: number;
  venda_data: Date;
  venda_total: number;
  venda_status: 'EM ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
  promocao_id: number | null;
  fornecedor_pessoa_id: number;
  pessoa_id: number;
  endereco_id: number | null;
  retirada_no_fornecedor: boolean;
  metodo_pagamento?: string | null;
  parcelas?: number;
  detalhes_pagamento?: Record<string, any> | null;
  itens: ItemVenda[];
}