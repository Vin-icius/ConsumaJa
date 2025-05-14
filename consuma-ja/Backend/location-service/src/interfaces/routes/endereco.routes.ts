import { Router } from 'express';
import { EnderecoController } from '../controls/endereco.controller';
import { EnderecoService } from '../../application/services/endereco.service';
import { EnderecoMySQLRepository } from '../../infrastructure/repositories/endereco.mysql.repository';
// import { authMiddleware } from '../middlewares/auth.middleware'; // Se for proteger

const router = Router();

const enderecoRepository = new EnderecoMySQLRepository();
const enderecoService = new EnderecoService(enderecoRepository);
const enderecoController = new EnderecoController(enderecoService);

router.get('/', enderecoController.listar);
// Outras rotas CRUD
router.post('/', /* authMiddleware, */ enderecoController.criar);
//router.get('/:id', /* authMiddleware, */ enderecoController.buscarPorId);
router.put('/:id', /* authMiddleware, */ enderecoController.atualizar);
router.delete('/:id', /* authMiddleware, */ enderecoController.excluir);

export default router;