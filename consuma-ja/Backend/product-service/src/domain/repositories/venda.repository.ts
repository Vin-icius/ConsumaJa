import { Venda } from '../entities/venda.entity';

export interface CreateVendaRepoData {
  venda_data: Date;
  venda_total: number;
  promocao_id: number | null;
  pessoa_id: number;
  endereco_id: number;
  itens: Array<{
    lote_id: number;
    quantidade: number;
    valor_unitario: number;
    promocao_id: number;
  }>;
}

export interface VendaRepository {
  criar(data: CreateVendaRepoData): Promise<Venda>;
}