import express from 'express';
import { ConfigController } from '../controls/config.controller';
import { ConfigService } from '../../application/services/config.service';
import { ConfigMySQLRepository } from '../../infrastructure/repositories/config.mysql.repository';
import { PessoaMySQLRepository } from '../../infrastructure/repositories/pessoa.mysql.repository';
// TODO: Import auth middleware when available
// import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// --- Instanciação (Idealmente usar DI) ---
const configRepository = new ConfigMySQLRepository();
const pessoaRepository = new PessoaMySQLRepository();
const configService = new ConfigService(configRepository);
const configController = new ConfigController(configService, pessoaRepository);

// --- Rotas ---
// Todas as rotas de configuração requerem autenticação
// TODO: Add auth middleware
// router.use(authMiddleware);

// GET /api/config/:pessoaId - Obter configurações do usuário
router.get('/:pessoaId', configController.getConfiguracoesUsuario);

// PUT /api/config/:pessoaId/notificacoes - Atualizar preferências de notificação
router.put('/:pessoaId/notificacoes', configController.atualizarNotificacoes);

// PUT /api/config/:pessoaId/senha - Alterar senha
router.put('/:pessoaId/senha', configController.alterarSenha);

// POST /api/config/:pessoaId/pagamento - Adicionar método de pagamento
router.post('/:pessoaId/pagamento', configController.adicionarMetodoPagamento);

// GET /api/config/:pessoaId/pagamentos - Listar métodos de pagamento
router.get('/:pessoaId/pagamentos', configController.listarMetodosPagamento);

// PUT /api/config/:pessoaId/pagamento/:pagamentoId - Atualizar método de pagamento
router.put('/:pessoaId/pagamento/:pagamentoId', configController.atualizarMetodoPagamento);

// PATCH /api/config/:pessoaId/pagamento/:pagamentoId/padrao - Definir método principal
router.patch('/:pessoaId/pagamento/:pagamentoId/padrao', configController.definirMetodoPagamentoPrincipal);

// DELETE /api/config/:pessoaId/pagamento/:pagamentoId - Remover método de pagamento
router.delete('/:pessoaId/pagamento/:pagamentoId', configController.removerMetodoPagamento);

// GET /api/config/:pessoaId/historico-pagamentos - Obter histórico de pagamentos
router.get('/:pessoaId/historico-pagamentos', configController.getHistoricoPagamentos);

// PUT /api/config/:pessoaId/2fa - Atualizar configuração 2FA
router.put('/:pessoaId/2fa', configController.atualizarConfiguracao2FA);

// GET /api/config/:pessoaId/2fa/qrcode - Gerar QR code para 2FA
router.get('/:pessoaId/2fa/qrcode', configController.gerarQRCode2FA);

// POST /api/config/:pessoaId/2fa/validar - Validar código 2FA
router.post('/:pessoaId/2fa/validar', configController.validarCodigo2FA);

// GET /api/config/verificar-2fa/:identificador - Verificar se 2FA está habilitado para o usuário
router.get('/verificar-2fa/:identificador', configController.verificar2FAUsuario);

export default router;
