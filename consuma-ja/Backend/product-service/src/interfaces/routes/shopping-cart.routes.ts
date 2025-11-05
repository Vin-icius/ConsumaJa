import express from "express"
import { ShoppingCartMySQLRepository } from "../../infrastructure/repositories/shopping-cart.mysql.repository"
import { PromocaoMySQLRepository } from "../../infrastructure/repositories/promocao.mysql.repository"
import { LoteProdMySQLRepository } from "../../infrastructure/repositories/loteprod.mysql.repository"
import { ShoppingCartService } from "../../application/services/shopping-cart.service"
import { ShoppingCartController } from "../controls/shopping-cart.controller"

const router = express.Router()

const cartRepository = new ShoppingCartMySQLRepository()
const promocaoRepository = new PromocaoMySQLRepository()
const loteRepository = new LoteProdMySQLRepository()
const cartService = new ShoppingCartService(cartRepository, promocaoRepository, loteRepository)
const cartController = new ShoppingCartController(cartService)

router.get("/", cartController.listar)
router.post("/", cartController.adicionar)
router.patch("/:id", cartController.atualizarQuantidade)
router.delete("/:id", cartController.remover)
router.delete("/", cartController.limpar)

export default router
