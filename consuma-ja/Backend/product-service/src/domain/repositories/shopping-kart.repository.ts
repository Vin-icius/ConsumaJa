import { ShoppingCartItem, ShoppingCartItemWithDetails, ShoppingCartStatus } from "../entities/shopping-cart.entity"

export interface AddCartItemData {
	pessoa_id: number
	produto_id: number
	promocao_id: number | null
	lote_id: number
	quantidade: number
	unit_price: number
}

export interface UpdateCartItemQuantityData {
	cart_item_id: number
	pessoa_id: number
	quantidade: number
}

export interface ShoppingCartRepository {
	findActiveItem(pessoaId: number, loteId: number, promocaoId: number | null): Promise<ShoppingCartItem | null>
	addItem(data: AddCartItemData): Promise<ShoppingCartItem>
	updateQuantity(data: UpdateCartItemQuantityData): Promise<ShoppingCartItem | null>
	listActiveByUser(pessoaId: number): Promise<ShoppingCartItemWithDetails[]>
	softDelete(cartItemId: number, pessoaId: number): Promise<boolean>
	softDeleteAll(pessoaId: number): Promise<void>
	markItemsStatus(cartItemIds: number[], pessoaId: number, status: ShoppingCartStatus): Promise<void>
}
