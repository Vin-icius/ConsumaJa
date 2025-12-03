import express from 'express';
import { ConfigController } from '../controls/config.controller';
import { ConfigService } from '../../application/services/config.service';
import { ConfigMySQLRepository } from '../../infrastructure/repositories/config.mysql.repository';
import { PessoaMySQLRepository } from '../../infrastructure/repositories/pessoa.mysql.repository';

const router = express.Router();

const configRepository = new ConfigMySQLRepository();
const pessoaRepository = new PessoaMySQLRepository();
const configService = new ConfigService(configRepository);
const configController = new ConfigController(configService, pessoaRepository);

router.get('/:fornecedorId/config-pagamento', configController.getConfiguracaoPagamentoFornecedor);
router.put('/:fornecedorId/config-pagamento', configController.atualizarConfiguracaoPagamentoFornecedor);

export default router;
