export interface LoteProd {
  lote_id: number;
  produto_id: number;
  lote_codigo: string;
  lote_validade: Date;
  lote_quantidade_inicial: number;
  lote_quantidade_atual: number;
  data_entrada: Date;
  ativo: boolean;
  // Opcional: adicionar nome do produto aqui para facilitar no picker
  produto_nome?: string;
}