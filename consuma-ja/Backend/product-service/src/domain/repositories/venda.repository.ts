import { Venda } from '../entities/venda.entity';

export interface CreateVendaRepoData {
  venda_data: Date;
  venda_total: number;
  pessoa_id: number;
  endereco_id: number;
  itens: Array<{
    lote_id: number;
    quantidade: number;
    valor_unitario: number;
  }>;
}

export interface VendaRepository {
  criar(data: CreateVendaRepoData): Promise<Venda>;
}