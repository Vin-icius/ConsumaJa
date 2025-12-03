export interface Tipo {
  tipo_id: number;
  tipo_nome: string;
  fornecedor_pessoa_id: number | null;
  ativo: boolean;
}