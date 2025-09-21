// src/interfaces/controls/config.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '../../application/services/config.service';
import { PessoaMySQLRepository } from '../../infrastructure/repositories/pessoa.mysql.repository';
import { AppError } from '../../common/errors/app-error';

export class ConfigController {
    constructor(private configService: ConfigService, private pessoaRepository?: PessoaMySQLRepository) {
        this.getConfiguracoesUsuario = this.getConfiguracoesUsuario.bind(this);
        this.atualizarNotificacoes = this.atualizarNotificacoes.bind(this);
        this.alterarSenha = this.alterarSenha.bind(this);
        this.adicionarMetodoPagamento = this.adicionarMetodoPagamento.bind(this);
        this.listarMetodosPagamento = this.listarMetodosPagamento.bind(this);
        this.removerMetodoPagamento = this.removerMetodoPagamento.bind(this);
        this.getHistoricoPagamentos = this.getHistoricoPagamentos.bind(this);
        this.atualizarConfiguracao2FA = this.atualizarConfiguracao2FA.bind(this);
        this.gerarQRCode2FA = this.gerarQRCode2FA.bind(this);
        this.validarCodigo2FA = this.validarCodigo2FA.bind(this);
        this.verificar2FAUsuario = this.verificar2FAUsuario.bind(this);
    }

    async getConfiguracoesUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const pessoaId = parseInt(req.params.pessoaId, 10);
            if (isNaN(pessoaId) || pessoaId <= 0) {
                throw new AppError('ID do usuário inválido.', 400);
            }

            const configuracoes = await this.configService.getConfiguracoesUsuario(pessoaId);
            res.status(200).json(configuracoes);
        } catch (error) {
            next(error);
        }
    }

    async atualizarNotificacoes(req: Request, res: Response, next: NextFunction): Promise<void> {
        const pessoaId = parseInt(req.params.pessoaId, 10);
        if (isNaN(pessoaId) || pessoaId <= 0) {
            return next(new AppError('ID do usuário inválido.', 400));
        }

        try {
            const resultado = await this.configService.atualizarNotificacoes(pessoaId, req.body);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async alterarSenha(req: Request, res: Response, next: NextFunction): Promise<void> {
        const pessoaId = parseInt(req.params.pessoaId, 10);
        if (isNaN(pessoaId) || pessoaId <= 0) {
            return next(new AppError('ID do usuário inválido.', 400));
        }

        try {
            await this.configService.alterarSenha(pessoaId, req.body);
            res.status(200).json({ message: 'Senha alterada com sucesso!' });
        } catch (error) {
            next(error);
        }
    }

    async adicionarMetodoPagamento(req: Request, res: Response, next: NextFunction): Promise<void> {
        const pessoaId = parseInt(req.params.pessoaId, 10);
        if (isNaN(pessoaId) || pessoaId <= 0) {
            return next(new AppError('ID do usuário inválido.', 400));
        }

        try {
            const metodoPagamento = await this.configService.adicionarMetodoPagamento(pessoaId, req.body);
            res.status(201).json(metodoPagamento);
        } catch (error) {
            next(error);
        }
    }

    async listarMetodosPagamento(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const pessoaId = parseInt(req.params.pessoaId, 10);
            if (isNaN(pessoaId) || pessoaId <= 0) {
                throw new AppError('ID do usuário inválido.', 400);
            }

            const metodos = await this.configService.listarMetodosPagamento(pessoaId);
            res.status(200).json(metodos);
        } catch (error) {
            next(error);
        }
    }

    async removerMetodoPagamento(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const pessoaId = parseInt(req.params.pessoaId, 10);
            const pagamentoId = parseInt(req.params.pagamentoId, 10);

            if (isNaN(pessoaId) || pessoaId <= 0) {
                throw new AppError('ID do usuário inválido.', 400);
            }
            if (isNaN(pagamentoId) || pagamentoId <= 0) {
                throw new AppError('ID do método de pagamento inválido.', 400);
            }

            await this.configService.removerMetodoPagamento(pessoaId, pagamentoId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getHistoricoPagamentos(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const pessoaId = parseInt(req.params.pessoaId, 10);
            if (isNaN(pessoaId) || pessoaId <= 0) {
                throw new AppError('ID do usuário inválido.', 400);
            }

            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;

            const historico = await this.configService.getHistoricoPagamentos(pessoaId, page, limit);
            res.status(200).json(historico);
        } catch (error) {
            next(error);
        }
    }

    async atualizarConfiguracao2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const pessoaId = parseInt(req.params.pessoaId, 10);
            const { habilitado } = req.body;

            if (isNaN(pessoaId) || pessoaId <= 0) {
                throw new AppError('ID do usuário inválido.', 400);
            }
            if (typeof habilitado !== 'boolean') {
                throw new AppError('Campo \'habilitado\' deve ser um booleano.', 400);
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

            if (isNaN(pessoaId) || pessoaId <= 0) {
                throw new AppError('ID do usuário inválido.', 400);
            }

            const qrCodeDataURL = await this.configService.gerarQRCode2FA(pessoaId);
            res.status(200).json({ qr_code: qrCodeDataURL });
        } catch (error) {
            next(error);
        }
    }

    async validarCodigo2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const pessoaId = parseInt(req.params.pessoaId, 10);
            const { codigo_2fa } = req.body;

            if (isNaN(pessoaId) || pessoaId <= 0) {
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
            const identificador = req.params.identificador;

            if (!identificador || typeof identificador !== 'string' || identificador.trim() === '') {
                throw new AppError('Identificador do usuário é obrigatório.', 400);
            }

            // Buscar usuário pelo login/email/cpf
            const usuario = await this.pessoaRepository?.findByLoginOrEmailOrDoc(identificador.trim());
            if (!usuario) {
                throw new AppError('Usuário não encontrado.', 404);
            }

            // Verificar status do 2FA
            const habilitado = await this.configService.is2FAEnabled(usuario.pessoa_id);

            res.status(200).json({
                autenticacao_2fa: habilitado
            });
        } catch (error) {
            next(error);
        }
    }
}
