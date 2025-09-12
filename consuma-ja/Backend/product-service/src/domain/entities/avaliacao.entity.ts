import { NotaAvaliacao } from "./nota-avaliacao.entity";

export interface Avaliacao {
  avaliacao_id: number;
  VENDA_venda_id: number; // Corresponde ao pedido_id no frontend
  PESSOA_pessoa_id: number;
  avaliacao_data: Date;
  avaliacao_descricao?: string; // Campo opcional para um comentário geral
  notas?: NotaAvaliacao[]; // Array de respostas
}