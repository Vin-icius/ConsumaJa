export enum NotaAvaliacaoEnum {
  PESSIMO = 1,
  RUIM = 2,
  BOM = 3,
  MUITO_BOM = 4,
  EXCELENTE = 5
}

export interface Avaliacao {
  avaliacao_id: number;
  produto_id: number;
  pessoa_id: number;
  pedido_id: number;
  nota: NotaAvaliacaoEnum;
  comentario?: string;
  data_criacao: Date;
  data_atualizacao: Date;
}