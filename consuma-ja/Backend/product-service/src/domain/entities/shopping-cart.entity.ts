export type ShoppingCartStatus = "ACTIVE" | "REMOVED" | "PURCHASED" | "EXPIRED"

export interface ShoppingCartItem {
  cart_item_id: number
  PESSOA_pessoa_id: number
  PRODUTO_produto_id: number
  PROMOCAO_promocao_id: number | null
  LOTEPROD_lote_id: number
  quantidade: number
  unit_price: number
  status: ShoppingCartStatus
  created_at: Date
  updated_at: Date
}

export interface ShoppingCartItemWithDetails extends ShoppingCartItem {
  produto_nome: string
  produto_imagem_url: string | null
  lote_codigo: string
  lote_quantidade_atual: number
  promocao_quantidade?: number | null
  fornecedor_nome?: string | null
  fornecedor_pessoa_id?: number | null
}
