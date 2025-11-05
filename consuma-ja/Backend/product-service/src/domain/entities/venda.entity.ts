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
  pessoa_id: number;
  endereco_id: number;
  itens: ItemVenda[];
}