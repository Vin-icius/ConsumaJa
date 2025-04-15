import express from 'express';
import { CategoriaController } from '../../interfaces/controls/categoria.controller';
import { CategoriaService } from '../../application/services/categoria.service';
import { CategoriaMySQLRepository } from '../../infrastructure/repositories/categoria.mysql.repository';

const router = express.Router();
const categoriaController = new CategoriaController(new CategoriaService(new CategoriaMySQLRepository()));

router.post('/', categoriaController.criarCategoria.bind(categoriaController));
router.get('/', categoriaController.listarCategorias.bind(categoriaController));
router.get('/:id', categoriaController.buscarCategoriaPorId.bind(categoriaController));
router.put('/:id', categoriaController.atualizarCategoria.bind(categoriaController));
router.delete('/:id', categoriaController.excluirCategoria.bind(categoriaController));

export default router;