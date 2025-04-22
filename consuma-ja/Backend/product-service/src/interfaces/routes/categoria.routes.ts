import express from 'express';
import { CategoriaController } from '../controls/categoria.controller';
import { CategoriaService } from '../../application/services/categoria.service';
import { CategoriaMySQLRepository } from '../../infrastructure/repositories/categoria.mysql.repository';

const router = express.Router();

const categoriaRepository = new CategoriaMySQLRepository();
const categoriaService = new CategoriaService(categoriaRepository);
const categoriaController = new CategoriaController(categoriaService);

router.post('/', categoriaController.criarCategoria);
router.get('/', categoriaController.listarCategorias);
router.get('/:id', categoriaController.buscarCategoriaPorId);
router.put('/:id', categoriaController.atualizarCategoria);
router.delete('/:id', categoriaController.excluirCategoria);

export default router;