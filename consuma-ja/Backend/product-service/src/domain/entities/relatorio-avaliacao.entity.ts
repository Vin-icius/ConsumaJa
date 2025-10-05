export interface RelatorioAvaliacao {
  avaliacao_id: number;
  avaliacao_data: Date;
  pessoa_id: number;
  pessoa_nome: string;
  venda_id: number;
  promocao_id?: number;
  promocao_descricao?: string;
  pergunta_id: number;
  pergunta_descricao: string;
  nota: number;
}