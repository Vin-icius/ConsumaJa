export interface Promocao {
  promocao_id: number
  promocao_descricao?: string
  fornecedor: { pessoa_id: number; pessoa_nome: string }
  itens_preview: Array<{ produto_id: number; produto_nome: string; itemPromocao_valor: number; imagem_url?: string }>
}
export interface CategoriaItem {
  categoria_id: number
  categoria_nome: string
}