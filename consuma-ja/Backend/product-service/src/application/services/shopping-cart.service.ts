import { AppError } from "../../common/errors/app-error"
import { LoteProdRepository } from "../../domain/repositories/loteprod.repository"
import { PromocaoRepository } from "../../domain/repositories/promocao.repository"
import {
  AddCartItemData,
  ShoppingCartRepository,
} from "../../domain/repositories/shopping-cart.repository"
import {
  ShoppingCartItemWithDetails,
  ShoppingCartStatus,
} from "../../domain/entities/shopping-cart.entity"

export interface AddCartItemDto {
  pessoa_id: number
  produto_id: number
  promocao_id: number
  lote_id: number
  quantidade: number
}

export interface UpdateCartItemQuantityDto {
  pessoa_id: number
  cart_item_id: number
  quantidade: number
}

export interface RemoveCartItemDto {
  pessoa_id: number
  cart_item_id: number
}

export interface CartItemView {
  cart_item_id: number
  produto_id: number
  produto_nome: string
  produto_imagem_url: string | null
  lote_id: number
  lote_codigo: string
  promocao_id: number | null
  fornecedor_nome: string | null
  fornecedor_pessoa_id: number | null
  quantidade: number
  unit_price: number
  max_quantidade: number
  is_out_of_stock: boolean
}

export interface CartViewResponse {
  items: CartItemView[]
  total_items: number
  total_value: number
}

export class ShoppingCartService {
  constructor(
    private readonly cartRepository: ShoppingCartRepository,
    private readonly promocaoRepository: PromocaoRepository,
    private readonly loteRepository: LoteProdRepository,
  ) {}

  private ensurePositiveQuantity(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new AppError("Quantidade informada deve ser maior que zero.", 400)
    }
  }

  private computeMaxAvailable(item: ShoppingCartItemWithDetails): number {
    const stockAvailable = Math.max(0, Number(item.lote_quantidade_atual))
    const promoAvailable = item.promocao_quantidade !== null ? Math.max(0, Number(item.promocao_quantidade)) : stockAvailable
    return Math.max(0, Math.min(stockAvailable, promoAvailable))
  }

  private mapToView(item: ShoppingCartItemWithDetails): CartItemView {
    const maxAvailable = this.computeMaxAvailable(item)
    return {
      cart_item_id: item.cart_item_id,
      produto_id: item.PRODUTO_produto_id,
      produto_nome: item.produto_nome,
      produto_imagem_url: item.produto_imagem_url,
      lote_id: item.LOTEPROD_lote_id,
      lote_codigo: item.lote_codigo,
      promocao_id: item.PROMOCAO_promocao_id,
      fornecedor_nome: item.fornecedor_nome ?? null,
      fornecedor_pessoa_id: item.fornecedor_pessoa_id ?? null,
      quantidade: item.quantidade,
      unit_price: item.unit_price,
      max_quantidade: maxAvailable,
      is_out_of_stock: maxAvailable <= 0,
    }
  }

  private async clampQuantityIfNeeded(item: ShoppingCartItemWithDetails, pessoaId: number): Promise<ShoppingCartItemWithDetails> {
    const maxAvailable = this.computeMaxAvailable(item)
    if (item.quantidade <= maxAvailable) {
      return item
    }
    const clampedQuantity = Math.max(0, maxAvailable)
    const updated = await this.cartRepository.updateQuantity({
      cart_item_id: item.cart_item_id,
      pessoa_id: pessoaId,
      quantidade: clampedQuantity,
    })
    if (!updated) {
      const fallback = await this.cartRepository.findItemWithDetails(item.cart_item_id, pessoaId)
      return fallback ?? item
    }
    const refreshed = await this.cartRepository.findItemWithDetails(item.cart_item_id, pessoaId)
    return refreshed ?? { ...item, quantidade: clampedQuantity }
  }

  private async normalizeCartItems(items: ShoppingCartItemWithDetails[], pessoaId: number): Promise<ShoppingCartItemWithDetails[]> {
    const normalized: ShoppingCartItemWithDetails[] = []
    for (const item of items) {
      const adjusted = await this.clampQuantityIfNeeded(item, pessoaId)
      normalized.push(adjusted)
    }
    return normalized
  }

  async getCartForUser(pessoaId: number): Promise<CartViewResponse> {
    if (!pessoaId) {
      throw new AppError("Usuário inválido para o carrinho.", 400)
    }
    const dbItems = await this.cartRepository.listActiveByUser(pessoaId)
    const normalized = await this.normalizeCartItems(dbItems, pessoaId)
    const views = normalized.map((item) => this.mapToView(item))
    const totalItems = views.reduce((sum, item) => sum + item.quantidade, 0)
    const totalValue = views.reduce((sum, item) => sum + item.quantidade * item.unit_price, 0)
    return {
      items: views,
      total_items: totalItems,
      total_value: Number(totalValue.toFixed(2)),
    }
  }

  async addItem(dto: AddCartItemDto): Promise<CartItemView> {
    this.ensurePositiveQuantity(dto.quantidade)
    const lote = await this.loteRepository.buscarPorId(dto.lote_id, true)
    if (!lote) {
      throw new AppError("Lote não encontrado ou inativo.", 404)
    }
    if (lote.produto_id !== dto.produto_id) {
      throw new AppError("Lote informado não pertence ao produto selecionado.", 400)
    }

    if (dto.promocao_id === null) {
      throw new AppError("Itens precisam estar vinculados a uma promoção ativa.", 400)
    }

    const promocao = await this.promocaoRepository.buscarPorIdComItens(dto.promocao_id, false)
    if (!promocao || !promocao.itens) {
      throw new AppError("Promoção não encontrada ou inativa.", 404)
    }
    const itemPromocao = promocao.itens.find((item) => item.LOTEPROD_lote_id === dto.lote_id)
    if (!itemPromocao) {
      throw new AppError("Lote não disponível na promoção informada.", 400)
    }

    const unitPrice = Number(itemPromocao.itemPromocao_valor)
    const promocaoDisponivel = Number(itemPromocao.itemPromocao_qtde)

    const maxDisponivel = Math.max(0, Math.min(lote.lote_quantidade_atual, promocaoDisponivel))
    if (maxDisponivel <= 0) {
      throw new AppError("Produto esgotado para o lote selecionado.", 409)
    }

    const existente = await this.cartRepository.findActiveItem(dto.pessoa_id, dto.lote_id, dto.promocao_id)
    let finalItem: ShoppingCartItemWithDetails | null = null

    if (existente) {
      const novaQuantidade = Math.min(existente.quantidade + dto.quantidade, maxDisponivel)
      await this.cartRepository.updateQuantity({
        cart_item_id: existente.cart_item_id,
        pessoa_id: dto.pessoa_id,
        quantidade: novaQuantidade,
      })
      finalItem = await this.cartRepository.findItemWithDetails(existente.cart_item_id, dto.pessoa_id)
    } else {
      const payload: AddCartItemData = {
        pessoa_id: dto.pessoa_id,
        produto_id: dto.produto_id,
        promocao_id: dto.promocao_id,
        lote_id: dto.lote_id,
        quantidade: Math.min(dto.quantidade, maxDisponivel),
        unit_price: unitPrice,
      }
      const created = await this.cartRepository.addItem(payload)
      finalItem = await this.cartRepository.findItemWithDetails(created.cart_item_id, dto.pessoa_id)
    }

    if (!finalItem) {
      throw new AppError("Falha ao processar item do carrinho.", 500, false)
    }

    return this.mapToView(finalItem)
  }

  async updateItemQuantity(dto: UpdateCartItemQuantityDto): Promise<CartItemView | null> {
    if (dto.quantidade <= 0) {
      await this.removeItem({ pessoa_id: dto.pessoa_id, cart_item_id: dto.cart_item_id })
      return null
    }

    const current = await this.cartRepository.findItemWithDetails(dto.cart_item_id, dto.pessoa_id)
    if (!current) {
      throw new AppError("Item do carrinho não encontrado.", 404)
    }

    const maxDisponivel = this.computeMaxAvailable(current)
    if (maxDisponivel <= 0) {
      await this.cartRepository.updateQuantity({
        cart_item_id: dto.cart_item_id,
        pessoa_id: dto.pessoa_id,
        quantidade: 0,
      })
      const updated = await this.cartRepository.findItemWithDetails(dto.cart_item_id, dto.pessoa_id)
      if (!updated) {
        return null
      }
      return this.mapToView(updated)
    }

    const novaQuantidade = Math.min(dto.quantidade, maxDisponivel)
    await this.cartRepository.updateQuantity({
      cart_item_id: dto.cart_item_id,
      pessoa_id: dto.pessoa_id,
      quantidade: novaQuantidade,
    })
    const updated = await this.cartRepository.findItemWithDetails(dto.cart_item_id, dto.pessoa_id)
    if (!updated) {
      throw new AppError("Falha ao atualizar item do carrinho.", 500, false)
    }
    return this.mapToView(updated)
  }

  async removeItem(dto: RemoveCartItemDto): Promise<void> {
    const removed = await this.cartRepository.softDelete(dto.cart_item_id, dto.pessoa_id)
    if (!removed) {
      throw new AppError("Item do carrinho não encontrado para remoção.", 404)
    }
  }

  async clearCart(pessoaId: number): Promise<void> {
    if (!pessoaId) {
      throw new AppError("Usuário inválido para limpeza do carrinho.", 400)
    }
    await this.cartRepository.softDeleteAll(pessoaId)
  }

  async markItems(dto: { pessoa_id: number; cart_item_ids: number[]; status: ShoppingCartStatus }): Promise<void> {
    await this.cartRepository.markItemsStatus(dto.cart_item_ids, dto.pessoa_id, dto.status)
  }
}
