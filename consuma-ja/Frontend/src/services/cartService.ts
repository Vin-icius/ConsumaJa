import { productApiClient } from "../api/client"

export interface CartItemApi {
  cart_item_id: number
  produto_id: number
  produto_nome: string
  produto_imagem_url: string | null
  lote_id: number
  lote_codigo: string
  promocao_id: number | null
  fornecedor_nome: string | null
  quantidade: number
  unit_price: number
  max_quantidade: number
  is_out_of_stock: boolean
}

export interface CartViewApiResponse {
  items: CartItemApi[]
  total_items: number
  total_value: number
}

interface AddCartItemPayload {
  pessoa_id: number
  produto_id: number
  promocao_id: number
  lote_id: number
  quantidade: number
}

interface UpdateCartItemPayload {
  pessoa_id: number
  quantidade: number
}

const handleRequest = async <T>(requestPromise: Promise<{ data: T }>): Promise<T> => {
  try {
    const response = await requestPromise
    return response.data
  } catch (error: any) {
    const targetUrl = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`
    console.error(`[CartService] Request failed (${targetUrl}):`, error.response?.data || error.message || error)
    throw error
  }
}

const getCartByPessoa = (pessoaId: number): Promise<CartViewApiResponse> => {
  return handleRequest(productApiClient.get<CartViewApiResponse>("/cart", { params: { pessoaId } }))
}

const addItemToCart = (payload: AddCartItemPayload) => {
  return handleRequest(productApiClient.post<{ item: CartItemApi; cart: CartViewApiResponse }>("/cart", payload))
}

const updateCartItemQuantity = (cartItemId: number, payload: UpdateCartItemPayload) => {
  return handleRequest(
    productApiClient.patch<{ item: CartItemApi | null; cart: CartViewApiResponse }>(`/cart/${cartItemId}`, payload),
  )
}

const removeCartItem = (cartItemId: number, pessoaId: number) => {
  return handleRequest(productApiClient.delete<{ cart: CartViewApiResponse }>(`/cart/${cartItemId}`, { params: { pessoaId } }))
}

const clearCart = (pessoaId: number) => {
  return handleRequest(productApiClient.delete<{ cart: CartViewApiResponse }>("/cart", { params: { pessoaId } }))
}

export default {
  getCartByPessoa,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
}
