import express from 'express';
import { CategoriaController } from '../controls/categoria.controller';
import { CategoriaService } from '../../application/services/categoria.service';
import { CategoriaMySQLRepository } from '../../infrastructure/repositories/categoria.mysql.repository';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

const categoriaRepository = new CategoriaMySQLRepository();
const categoriaService = new CategoriaService(categoriaRepository);
const categoriaController = new CategoriaController(categoriaService);

router.post('/', authMiddleware, categoriaController.criarCategoria);
router.get('/', categoriaController.listarCategorias);
router.get('/:id', categoriaController.buscarCategoriaPorId);
router.put('/:id', authMiddleware, categoriaController.atualizarCategoria);
router.delete('/:id', authMiddleware, categoriaController.excluirCategoria);

export default router;