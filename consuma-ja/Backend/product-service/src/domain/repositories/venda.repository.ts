import { Venda } from '../entities/venda.entity';

export interface CreateVendaRepoData {
  venda_data: Date;
  venda_total: number;
  promocao_id: number | null;
  fornecedor_pessoa_id: number;
  pessoa_id: number;
  endereco_id: number | null;
  retirada_no_fornecedor: boolean;
  metodo_pagamento?: string | null;
  parcelas?: number;
  detalhes_pagamento?: Record<string, any> | null;
  itens: Array<{
    lote_id: number;
    quantidade: number;
    valor_unitario: number;
    promocao_id: number;
  }>;
}

export interface VendaRepository {
  criar(data: CreateVendaRepoData): Promise<Venda>;
  buscarPorId(vendaId: number): Promise<Venda | null>;
}