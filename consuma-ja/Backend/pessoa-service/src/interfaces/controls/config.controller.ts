import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '../../application/services/config.service';
import { PessoaRepository } from '../../domain/repositories/pessoa.repository';
import { AppError } from '../../common/errors/app-error';

export class ConfigController {
  constructor(
    private readonly configService: ConfigService,
    private readonly pessoaRepository: PessoaRepository,
  ) {
    this.getConfiguracoesUsuario = this.getConfiguracoesUsuario.bind(this);
    this.atualizarNotificacoes = this.atualizarNotificacoes.bind(this);
    this.alterarSenha = this.alterarSenha.bind(this);
    this.adicionarMetodoPagamento = this.adicionarMetodoPagamento.bind(this);
    this.listarMetodosPagamento = this.listarMetodosPagamento.bind(this);
  this.atualizarMetodoPagamento = this.atualizarMetodoPagamento.bind(this);
    this.removerMetodoPagamento = this.removerMetodoPagamento.bind(this);
  this.definirMetodoPagamentoPrincipal = this.definirMetodoPagamentoPrincipal.bind(this);
    this.getHistoricoPagamentos = this.getHistoricoPagamentos.bind(this);
    this.atualizarConfiguracao2FA = this.atualizarConfiguracao2FA.bind(this);
    this.gerarQRCode2FA = this.gerarQRCode2FA.bind(this);
    this.validarCodigo2FA = this.validarCodigo2FA.bind(this);
    this.verificar2FAUsuario = this.verificar2FAUsuario.bind(this);
    this.getConfiguracaoPagamentoFornecedor = this.getConfiguracaoPagamentoFornecedor.bind(this);
    this.atualizarConfiguracaoPagamentoFornecedor = this.atualizarConfiguracaoPagamentoFornecedor.bind(this);
  }

  async getConfiguracoesUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      const configuracoes = await this.configService.getConfiguracoesUsuario(pessoaId);
      res.status(200).json(configuracoes);
    } catch (error) {
      next(error);
    }
  }

  async atualizarNotificacoes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      const resultado = await this.configService.atualizarNotificacoes(pessoaId, req.body);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async alterarSenha(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      await this.configService.alterarSenha(pessoaId, req.body);
      res.status(200).json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
      next(error);
    }
  }

  async adicionarMetodoPagamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      const metodo = await this.configService.adicionarMetodoPagamento(pessoaId, req.body);
      res.status(201).json(metodo);
    } catch (error) {
      next(error);
    }
  }

  async listarMetodosPagamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      const metodos = await this.configService.listarMetodosPagamento(pessoaId);
      res.status(200).json(metodos);
    } catch (error) {
      next(error);
    }
  }

  async atualizarMetodoPagamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);
      const pagamentoId = parseInt(req.params.pagamentoId, 10);

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      if (Number.isNaN(pagamentoId) || pagamentoId <= 0) {
        throw new AppError('ID do método de pagamento inválido.', 400);
      }

      const metodo = await this.configService.atualizarMetodoPagamento(pessoaId, pagamentoId, req.body);
      res.status(200).json(metodo);
    } catch (error) {
      next(error);
    }
  }

  async removerMetodoPagamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);
      const pagamentoId = parseInt(req.params.pagamentoId, 10);

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      if (Number.isNaN(pagamentoId) || pagamentoId <= 0) {
        throw new AppError('ID do método de pagamento inválido.', 400);
      }

      await this.configService.removerMetodoPagamento(pessoaId, pagamentoId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async definirMetodoPagamentoPrincipal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);
      const pagamentoId = parseInt(req.params.pagamentoId, 10);

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      if (Number.isNaN(pagamentoId) || pagamentoId <= 0) {
        throw new AppError('ID do método de pagamento inválido.', 400);
      }

      const metodos = await this.configService.definirMetodoPagamentoPrincipal(pessoaId, pagamentoId);
      res.status(200).json(metodos);
    } catch (error) {
      next(error);
    }
  }

  async getHistoricoPagamentos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      const page = parseInt(String(req.query.page ?? '1'), 10) || 1;
      const limit = parseInt(String(req.query.limit ?? '10'), 10) || 10;

      const historico = await this.configService.getHistoricoPagamentos(pessoaId, page, limit);
      res.status(200).json(historico);
    } catch (error) {
      next(error);
    }
  }

  async atualizarConfiguracao2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);
      const { habilitado } = req.body as { habilitado?: boolean };

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      if (typeof habilitado !== 'boolean') {
        throw new AppError("Campo 'habilitado' deve ser um booleano.", 400);
      }

      const resultado = await this.configService.atualizarConfiguracao2FA(pessoaId, habilitado);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async gerarQRCode2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      const qrCode = await this.configService.gerarQRCode2FA(pessoaId);
      res.status(200).json({ qr_code: qrCode });
    } catch (error) {
      next(error);
    }
  }

  async validarCodigo2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pessoaId = parseInt(req.params.pessoaId, 10);
      const { codigo_2fa } = req.body as { codigo_2fa?: string };

      if (Number.isNaN(pessoaId) || pessoaId <= 0) {
        throw new AppError('ID do usuário inválido.', 400);
      }

      if (!codigo_2fa || typeof codigo_2fa !== 'string' || codigo_2fa.length !== 6) {
        throw new AppError('Código 2FA deve ter exatamente 6 dígitos.', 400);
      }

      const valido = await this.configService.validarCodigo2FA(pessoaId, codigo_2fa);
      res.status(200).json({ valido });
    } catch (error) {
      next(error);
    }
  }

  async verificar2FAUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identificador = (req.params.identificador ?? '').trim();

      if (!identificador) {
        throw new AppError('Identificador do usuário é obrigatório.', 400);
      }

      const usuario = await this.pessoaRepository.findByLoginOrEmailOrDoc(identificador);

      if (!usuario) {
        throw new AppError('Usuário não encontrado.', 404);
      }

      const habilitado = await this.configService.is2FAEnabled(usuario.pessoa_id);

      res.status(200).json({ autenticacao_2fa: habilitado });
    } catch (error) {
      next(error);
    }
  }

  async getConfiguracaoPagamentoFornecedor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fornecedorId = parseInt(req.params.fornecedorId ?? req.params.pessoaId, 10);

      if (Number.isNaN(fornecedorId) || fornecedorId <= 0) {
        throw new AppError('ID do fornecedor inválido.', 400);
      }

      const configuracao = await this.configService.getConfiguracaoPagamentoFornecedor(fornecedorId);
      res.status(200).json(configuracao);
    } catch (error) {
      next(error);
    }
  }

  async atualizarConfiguracaoPagamentoFornecedor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fornecedorId = parseInt(req.params.fornecedorId ?? req.params.pessoaId, 10);

      if (Number.isNaN(fornecedorId) || fornecedorId <= 0) {
        throw new AppError('ID do fornecedor inválido.', 400);
      }

      const configuracao = await this.configService.salvarConfiguracaoPagamentoFornecedor(fornecedorId, req.body);
      res.status(200).json(configuracao);
    } catch (error) {
      next(error);
    }
  }
}
