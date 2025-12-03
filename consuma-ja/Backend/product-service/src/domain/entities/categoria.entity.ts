export interface Categoria {
  categoria_id: number;
  categoria_nome: string;
  fornecedor_pessoa_id: number | null;
  ativo: boolean;          // Para exclusão lógica
}