import { pool } from "../database/mysql.connection"
import { AppError } from "../../common/errors/app-error"
import {
  AddCartItemData,
  ShoppingCartRepository,
  UpdateCartItemQuantityData,
} from "../../domain/repositories/shopping-cart.repository"
import {
  ShoppingCartItem,
  ShoppingCartItemWithDetails,
  ShoppingCartStatus,
} from "../../domain/entities/shopping-cart.entity"
import { buildProductImagePublicPath } from "../../common/utils/image-url"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"

interface ShoppingCartRow extends RowDataPacket {
  cart_item_id: number
  PESSOA_pessoa_id: number
  PRODUTO_produto_id: number
  PROMOCAO_promocao_id: number | null
  LOTEPROD_lote_id: number
  quantidade: number
  unit_price: string | number
  status: ShoppingCartStatus
  created_at: Date
  updated_at: Date
}

interface ShoppingCartDetailRow extends ShoppingCartRow {
  produto_nome: string
  produto_imagem_url: string | null
  lote_codigo: string
  lote_quantidade_atual: number
  itemPromocao_qtde: number | null
  fornecedor_nome: string | null
}

const mapRowToCartItem = (row: ShoppingCartRow): ShoppingCartItem => ({
  cart_item_id: row.cart_item_id,
  PESSOA_pessoa_id: row.PESSOA_pessoa_id,
  PRODUTO_produto_id: row.PRODUTO_produto_id,
  PROMOCAO_promocao_id: row.PROMOCAO_promocao_id,
  LOTEPROD_lote_id: row.LOTEPROD_lote_id,
  quantidade: Number(row.quantidade),
  unit_price: Number(row.unit_price),
  status: row.status,
  created_at: new Date(row.created_at),
  updated_at: new Date(row.updated_at),
})

const mapDetailRow = (row: ShoppingCartDetailRow): ShoppingCartItemWithDetails => ({
  ...mapRowToCartItem(row),
  produto_nome: row.produto_nome,
  produto_imagem_url: buildProductImagePublicPath(row.produto_imagem_url),
  lote_codigo: row.lote_codigo,
  lote_quantidade_atual: Number(row.lote_quantidade_atual),
  promocao_quantidade: row.itemPromocao_qtde !== null ? Number(row.itemPromocao_qtde) : null,
  fornecedor_nome: row.fornecedor_nome,
})

export class ShoppingCartMySQLRepository implements ShoppingCartRepository {
  async findActiveItem(pessoaId: number, loteId: number, promocaoId: number | null): Promise<ShoppingCartItem | null> {
    const query = `
      SELECT *
      FROM SHOPPING_CART
      WHERE PESSOA_pessoa_id = ?
        AND LOTEPROD_lote_id = ?
        AND ${promocaoId === null ? "PROMOCAO_promocao_id IS NULL" : "PROMOCAO_promocao_id = ?"}
        AND status = 'ACTIVE'
      LIMIT 1
    `
    const params = promocaoId === null ? [pessoaId, loteId] : [pessoaId, loteId, promocaoId]
    const [rows] = await pool.query<ShoppingCartRow[]>(query, params)
    if (!rows.length) return null
    return mapRowToCartItem(rows[0])
  }

  async addItem(data: AddCartItemData): Promise<ShoppingCartItem> {
    const query = `
      INSERT INTO SHOPPING_CART
        (PESSOA_pessoa_id, PRODUTO_produto_id, PROMOCAO_promocao_id, LOTEPROD_lote_id, quantidade, unit_price, status)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
    `
    const params = [
      data.pessoa_id,
      data.produto_id,
      data.promocao_id,
      data.lote_id,
      data.quantidade,
      data.unit_price,
    ]

    const [result] = await pool.query<ResultSetHeader>(query, params)
    const insertedId = result.insertId
    const [rows] = await pool.query<ShoppingCartRow[]>(
      "SELECT * FROM SHOPPING_CART WHERE cart_item_id = ? LIMIT 1",
      [insertedId],
    )
    if (!rows.length) {
      throw new AppError("Falha ao buscar item do carrinho após criação.", 500, false)
    }
    return mapRowToCartItem(rows[0])
  }

  async updateQuantity(data: UpdateCartItemQuantityData): Promise<ShoppingCartItem | null> {
    const query = `
      UPDATE SHOPPING_CART
         SET quantidade = ?, updated_at = NOW()
       WHERE cart_item_id = ?
         AND PESSOA_pessoa_id = ?
         AND status = 'ACTIVE'
    `
    const [result] = await pool.query<ResultSetHeader>(query, [data.quantidade, data.cart_item_id, data.pessoa_id])
    if (!result.affectedRows) {
      return null
    }
    const [rows] = await pool.query<ShoppingCartRow[]>(
      "SELECT * FROM SHOPPING_CART WHERE cart_item_id = ? LIMIT 1",
      [data.cart_item_id],
    )
    if (!rows.length) {
      return null
    }
    return mapRowToCartItem(rows[0])
  }

  async findItemWithDetails(cartItemId: number, pessoaId: number): Promise<ShoppingCartItemWithDetails | null> {
    const query = `
      SELECT
        sc.*, p.produto_nome, p.produto_imagem_url,
        lp.lote_codigo, lp.lote_quantidade_atual,
        ip.itemPromocao_qtde, pj.pessoa_nome AS fornecedor_nome
      FROM SHOPPING_CART sc
      INNER JOIN PRODUTO p ON p.produto_id = sc.PRODUTO_produto_id
      INNER JOIN LOTEPROD lp ON lp.lote_id = sc.LOTEPROD_lote_id
      LEFT JOIN ITEM_PROMOCAO ip
        ON ip.PROMOCAO_promocao_id = sc.PROMOCAO_promocao_id
       AND ip.LOTEPROD_lote_id = sc.LOTEPROD_lote_id
      LEFT JOIN PROMOCAO pr ON pr.promocao_id = sc.PROMOCAO_promocao_id
      LEFT JOIN PESSOA pj ON pj.pessoa_id = pr.JURIDICA_PESSOA_pessoa_id
      WHERE sc.cart_item_id = ? AND sc.PESSOA_pessoa_id = ?
      LIMIT 1
    `
    const [rows] = await pool.query<ShoppingCartDetailRow[]>(query, [cartItemId, pessoaId])
    if (!rows.length) return null
    return mapDetailRow(rows[0])
  }

  async listActiveByUser(pessoaId: number): Promise<ShoppingCartItemWithDetails[]> {
    const query = `
      SELECT
        sc.*, p.produto_nome, p.produto_imagem_url,
        lp.lote_codigo, lp.lote_quantidade_atual,
        ip.itemPromocao_qtde, pj.pessoa_nome AS fornecedor_nome
      FROM SHOPPING_CART sc
      INNER JOIN PRODUTO p ON p.produto_id = sc.PRODUTO_produto_id
      INNER JOIN LOTEPROD lp ON lp.lote_id = sc.LOTEPROD_lote_id
      LEFT JOIN ITEM_PROMOCAO ip
        ON ip.PROMOCAO_promocao_id = sc.PROMOCAO_promocao_id
       AND ip.LOTEPROD_lote_id = sc.LOTEPROD_lote_id
      LEFT JOIN PROMOCAO pr ON pr.promocao_id = sc.PROMOCAO_promocao_id
      LEFT JOIN PESSOA pj ON pj.pessoa_id = pr.JURIDICA_PESSOA_pessoa_id
      WHERE sc.PESSOA_pessoa_id = ?
        AND sc.status = 'ACTIVE'
      ORDER BY sc.created_at ASC
    `
    const [rows] = await pool.query<ShoppingCartDetailRow[]>(query, [pessoaId])
    return rows.map(mapDetailRow)
  }

  async softDelete(cartItemId: number, pessoaId: number): Promise<boolean> {
    const query = `
      UPDATE SHOPPING_CART
         SET status = 'REMOVED', updated_at = NOW()
       WHERE cart_item_id = ? AND PESSOA_pessoa_id = ? AND status = 'ACTIVE'
    `
    const [result] = await pool.query<ResultSetHeader>(query, [cartItemId, pessoaId])
    return result.affectedRows > 0
  }

  async softDeleteAll(pessoaId: number): Promise<void> {
    await pool.query(
      `UPDATE SHOPPING_CART SET status = 'REMOVED', updated_at = NOW()
        WHERE PESSOA_pessoa_id = ? AND status = 'ACTIVE'`,
      [pessoaId],
    )
  }

  async markItemsStatus(cartItemIds: number[], pessoaId: number, status: ShoppingCartStatus): Promise<void> {
    if (!cartItemIds.length) return
    const placeholders = cartItemIds.map(() => "?").join(",")
    const query = `
      UPDATE SHOPPING_CART
         SET status = ?, updated_at = NOW()
       WHERE cart_item_id IN (${placeholders})
         AND PESSOA_pessoa_id = ?
    `
    await pool.query(query, [status, ...cartItemIds, pessoaId])
  }
}
