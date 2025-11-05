import { Request, Response, NextFunction } from "express"
import { plainToClass } from "class-transformer"
import { validate } from "class-validator"
import { ShoppingCartService } from "../../application/services/shopping-cart.service"
import { AddCartItemRequestDto } from "../dtos/add-cart-item.dto"
import { UpdateCartItemQuantityRequestDto } from "../dtos/update-cart-item-quantity.dto"
import { AppError } from "../../common/errors/app-error"

export class ShoppingCartController {
  constructor(private readonly cartService: ShoppingCartService) {
    this.listar = this.listar.bind(this)
    this.adicionar = this.adicionar.bind(this)
    this.atualizarQuantidade = this.atualizarQuantidade.bind(this)
    this.remover = this.remover.bind(this)
    this.limpar = this.limpar.bind(this)
  }

  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaIdParam = req.query.pessoaId
      const pessoaId = Number(pessoaIdParam)
      if (!pessoaId || Number.isNaN(pessoaId)) {
        throw new AppError("Parâmetro pessoaId obrigatório para listar o carrinho.", 400)
      }
      const cart = await this.cartService.getCartForUser(pessoaId)
      res.status(200).json(cart)
    } catch (error) {
      next(error)
    }
  }

  async adicionar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = plainToClass(AddCartItemRequestDto, req.body)
      const errors = await validate(dto)
      if (errors.length > 0) {
        throw errors
      }
      const item = await this.cartService.addItem(dto)
      const cart = await this.cartService.getCartForUser(dto.pessoa_id)
      res.status(201).json({ item, cart })
    } catch (error) {
      next(error)
    }
  }

  async atualizarQuantidade(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cartItemId = Number(req.params.id)
      if (!cartItemId || Number.isNaN(cartItemId)) {
        throw new AppError("Informe um item válido para atualização.", 400)
      }
      const dto = plainToClass(UpdateCartItemQuantityRequestDto, {
        ...req.body,
        cart_item_id: cartItemId,
      })
      const errors = await validate(dto)
      if (errors.length > 0) {
        throw errors
      }
      const updated = await this.cartService.updateItemQuantity(dto)
      const cart = await this.cartService.getCartForUser(dto.pessoa_id)
      res.status(200).json({ item: updated, cart })
    } catch (error) {
      next(error)
    }
  }

  async remover(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cartItemId = Number(req.params.id)
      if (!cartItemId || Number.isNaN(cartItemId)) {
        throw new AppError("Informe um item válido para remoção.", 400)
      }
      const pessoaIdParam = req.query.pessoaId ?? req.body?.pessoa_id
      const pessoaId = Number(pessoaIdParam)
      if (!pessoaId || Number.isNaN(pessoaId)) {
        throw new AppError("Parâmetro pessoaId obrigatório para remover item do carrinho.", 400)
      }
      await this.cartService.removeItem({ pessoa_id: pessoaId, cart_item_id: cartItemId })
      const cart = await this.cartService.getCartForUser(pessoaId)
      res.status(200).json({ cart })
    } catch (error) {
      next(error)
    }
  }

  async limpar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaIdParam = req.query.pessoaId ?? req.body?.pessoa_id
      const pessoaId = Number(pessoaIdParam)
      if (!pessoaId || Number.isNaN(pessoaId)) {
        throw new AppError("Parâmetro pessoaId obrigatório para limpar o carrinho.", 400)
      }
      await this.cartService.clearCart(pessoaId)
      const cart = await this.cartService.getCartForUser(pessoaId)
      res.status(200).json({ cart })
    } catch (error) {
      next(error)
    }
  }
}
