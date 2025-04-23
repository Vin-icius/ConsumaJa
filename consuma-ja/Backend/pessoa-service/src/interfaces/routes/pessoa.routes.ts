import express from 'express';
import { PessoaController } from '../controls/pessoa.controller';
import { PessoaService } from '../../application/services/pessoa.service';
import { PessoaMySQLRepository } from '../../infrastructure/repositories/pessoa.mysql.repository';
import upload from '../../config/multer.config';

const router = express.Router();

// --- Instanciação (Idealmente usar DI) ---
const pessoaRepository = new PessoaMySQLRepository();
const pessoaService = new PessoaService(pessoaRepository);
const pessoaController = new PessoaController(pessoaService);

// --- Rotas ---

// Registro é público
router.post('/registrar', pessoaController.registrar);

// Upload de fotos (Middleware Multer -> Controller)
router.post('/:id/upload/:tipoFoto', upload.single('foto'), pessoaController.uploadFoto);
// ---------------------------------------------
router.get('/:id', /* authMiddleware, */ pessoaController.buscarPorId);
router.get('/', /* authMiddleware, */ pessoaController.listarPessoas);        // <<< ADICIONADO: Listar todos (ou filtrar)
router.get('/:id', /* authMiddleware, */ pessoaController.buscarPorId);       // <<< Mantido
router.put('/:id', /* authMiddleware, */ pessoaController.atualizarPessoa);   // <<< ADICIONADO: Atualizar
router.delete('/:id', /* authMiddleware, */ pessoaController.excluirPessoa);  // <<< ADICIONADO: Excluir (Lógico)

export default router;