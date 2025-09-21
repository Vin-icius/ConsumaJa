// src/application/services/config.service.ts
import { ConfigMySQLRepository } from '../../infrastructure/repositories/config.mysql.repository';
import { UpdateNotificacoesDto } from '../../interfaces/dtos/update-notificacoes.dto';
import { AlterarSenhaDto } from '../../interfaces/dtos/alterar-senha.dto';
import { AdicionarMetodoPagamentoDto } from '../../interfaces/dtos/adicionar-metodo-pagamento.dto';
import { AppError } from '../../common/errors/app-error';
import * as bcrypt from 'bcrypt';
import { encrypt, decrypt } from '../../common/utils/encryption.util';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

export class ConfigService {
    constructor(private configRepository: ConfigMySQLRepository) {}

    async getConfiguracoesUsuario(pessoaId: number): Promise<any> {
        const pessoa = await this.configRepository.findPessoaById(pessoaId);
        if (!pessoa) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        const [notificacoes, metodosPagamento, configuracao2FA] = await Promise.all([
            this.configRepository.findNotificacoesByPessoaId(pessoaId),
            this.configRepository.findMetodosPagamentoByPessoaId(pessoaId),
            this.configRepository.findConfiguracao2FAByPessoaId(pessoaId),
        ]);

        return {
            notificacoes: notificacoes || {
                email_notificacoes: true,
                sms_notificacoes: false,
                marketing_notificacoes: true,
                push_notificacoes: true,
            },
            metodos_pagamento: metodosPagamento.map((metodo: any) => ({
                id: metodo.id,
                tipo: metodo.tipo,
                numero_cartao: decrypt(metodo.numero_cartao).slice(-4), // Últimos 4 dígitos
                nome_cartao: metodo.nome_cartao,
                data_validade: metodo.data_validade,
                principal: metodo.principal,
            })),
            autenticacao_2fa: configuracao2FA?.habilitado || false,
        };
    }

    async atualizarNotificacoes(pessoaId: number, dto: UpdateNotificacoesDto): Promise<any> {
        const pessoa = await this.configRepository.findPessoaById(pessoaId);
        if (!pessoa) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        let notificacoes = await this.configRepository.findNotificacoesByPessoaId(pessoaId);

        if (!notificacoes) {
            notificacoes = {
                pessoa_id: pessoaId,
                email_notificacoes: dto.email_notificacoes ?? true,
                sms_notificacoes: dto.sms_notificacoes ?? false,
                marketing_notificacoes: dto.marketing_notificacoes ?? true,
                push_notificacoes: dto.push_notificacoes ?? true,
            };
        } else {
            Object.assign(notificacoes, dto);
        }

        await this.configRepository.saveNotificacoes(notificacoes);

        // Log de auditoria
        await this.configRepository.saveLogAuditoria({
            pessoa_id: pessoaId,
            acao: 'ATUALIZAR_NOTIFICACOES',
            detalhes: JSON.stringify(dto),
            ip_address: '', // Será preenchido pelo middleware
            user_agent: '', // Será preenchido pelo middleware
        });

        return notificacoes;
    }

    async alterarSenha(pessoaId: number, dto: AlterarSenhaDto): Promise<void> {
        const pessoa = await this.configRepository.findPessoaById(pessoaId);
        if (!pessoa) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        // Verificar senha atual
        const senhaCorreta = await bcrypt.compare(dto.senha_atual, pessoa.pessoa_senha);
        if (!senhaCorreta) {
            throw new AppError('Senha atual incorreta.', 400);
        }

        // Verificar se nova senha é diferente da atual
        const novaSenhaIgual = await bcrypt.compare(dto.nova_senha, pessoa.pessoa_senha);
        if (novaSenhaIgual) {
            throw new AppError('A nova senha deve ser diferente da senha atual.', 400);
        }

        // Verificar confirmação
        if (dto.nova_senha !== dto.confirmar_senha) {
            throw new AppError('A confirmação da senha não corresponde.', 400);
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(dto.nova_senha, 12);
        await this.configRepository.updatePessoaSenha(pessoaId, hashedPassword);

        // Log de auditoria
        await this.configRepository.saveLogAuditoria({
            pessoa_id: pessoaId,
            acao: 'ALTERAR_SENHA',
            detalhes: JSON.stringify({ mensagem: 'Senha alterada com sucesso' }),
            ip_address: '',
            user_agent: '',
        });

        // Invalidar todas as sessões ativas (exceto a atual)
        await this.configRepository.updateSessoesByPessoaId(pessoaId, { ativo: false });
    }

    async adicionarMetodoPagamento(pessoaId: number, dto: AdicionarMetodoPagamentoDto): Promise<any> {
        const pessoa = await this.configRepository.findPessoaById(pessoaId);
        if (!pessoa) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        // Verificar se já existe um cartão principal
        const metodos = await this.configRepository.findMetodosPagamentoByPessoaId(pessoaId);
        const cartaoPrincipal = metodos.find((m: any) => m.principal);

        // Normalizar tipo de pagamento para os valores do ENUM do banco
        let tipoNormalizado = dto.tipo.toUpperCase();
        let tipoBanco = '';

        if (tipoNormalizado === 'CREDITO' || tipoNormalizado === 'CARTAO') {
            tipoBanco = 'cartao_credito';
        } else if (tipoNormalizado === 'DEBITO') {
            tipoBanco = 'cartao_debito';
        } else if (tipoNormalizado === 'PIX') {
            tipoBanco = 'pix';
        } else if (tipoNormalizado === 'PAYPAL') {
            tipoBanco = 'paypal';
        } else if (tipoNormalizado === 'BOLETO') {
            tipoBanco = 'boleto';
        } else {
            throw new AppError('Tipo de pagamento inválido. Use: CARTAO, CREDITO, DEBITO, PIX, PAYPAL ou BOLETO.', 400);
        }

        // Construir objeto baseado no tipo de pagamento
        const metodoPagamento: any = {
            pessoa_id: pessoaId,
            tipo: tipoBanco, // Usar o valor mapeado para o ENUM
            principal: !cartaoPrincipal, // Primeiro cartão é principal
        };

        if (tipoNormalizado === 'CARTAO' || tipoNormalizado === 'CREDITO') {
            if (!dto.numero_cartao || !dto.nome_cartao || !dto.data_validade) {
                throw new AppError('Campos obrigatórios para cartão não fornecidos.', 400);
            }
            metodoPagamento.numero_cartao = encrypt(dto.numero_cartao);
            metodoPagamento.nome_cartao = dto.nome_cartao;
            metodoPagamento.data_validade = dto.data_validade;
            metodoPagamento.cvv = dto.cvv ? encrypt(dto.cvv) : null;
        } else if (tipoNormalizado === 'PIX') {
            if (!dto.chave_pix) {
                throw new AppError('Chave PIX é obrigatória para pagamentos PIX.', 400);
            }
            metodoPagamento.chave_pix = dto.chave_pix;
        } else if (tipoNormalizado === 'PAYPAL') {
            if (!dto.email_paypal) {
                throw new AppError('Email PayPal é obrigatório para pagamentos PayPal.', 400);
            }
            metodoPagamento.email_paypal = dto.email_paypal;
        }

        const saved = await this.configRepository.saveMetodoPagamento(metodoPagamento);

        // Log de auditoria
        await this.configRepository.saveLogAuditoria({
            pessoa_id: pessoaId,
            acao: 'ADICIONAR_METODO_PAGAMENTO',
            detalhes: JSON.stringify({ tipo: dto.tipo, mensagem: `Método de pagamento ${dto.tipo} adicionado` }),
            ip_address: '',
            user_agent: '',
        });

        return {
            id: saved.id,
            tipo: saved.tipo,
            numero_cartao: saved.numero_cartao ? decrypt(saved.numero_cartao).slice(-4) : null,
            nome_cartao: saved.nome_cartao,
            data_validade: saved.data_validade,
            principal: saved.principal,
        };
    }

    async listarMetodosPagamento(pessoaId: number): Promise<any[]> {
        const metodos = await this.configRepository.findMetodosPagamentoByPessoaId(pessoaId);

        return metodos.map((metodo: any) => ({
            id: metodo.id,
            tipo: metodo.tipo,
            numero_cartao: decrypt(metodo.numero_cartao).slice(-4),
            nome_cartao: metodo.nome_cartao,
            data_validade: metodo.data_validade,
            principal: metodo.principal,
        }));
    }

    async removerMetodoPagamento(pessoaId: number, pagamentoId: number): Promise<void> {
        const metodo = await this.configRepository.findMetodoPagamentoById(pagamentoId, pessoaId);

        if (!metodo) {
            throw new AppError('Método de pagamento não encontrado.', 404);
        }

        // Permitir remover qualquer método de pagamento, incluindo o último
        await this.configRepository.removeMetodoPagamento(metodo);

        // Se era principal, definir outro como principal (se houver)
        if (metodo.principal) {
            const metodos = await this.configRepository.findMetodosPagamentoByPessoaId(pessoaId);
            if (metodos.length > 0) {
                const proximoPrincipal = metodos[0];
                proximoPrincipal.principal = true;
                await this.configRepository.saveMetodoPagamento(proximoPrincipal);
            }
        }

        // Log de auditoria
        await this.configRepository.saveLogAuditoria({
            pessoa_id: pessoaId,
            acao: 'REMOVER_METODO_PAGAMENTO',
            detalhes: JSON.stringify({ pagamento_id: pagamentoId, mensagem: `Método de pagamento ${pagamentoId} removido` }),
            ip_address: '',
            user_agent: '',
        });
    }

    async getHistoricoPagamentos(pessoaId: number, page: number = 1, limit: number = 10): Promise<any> {
        return this.configRepository.findHistoricoPagamentosByPessoaId(pessoaId, page, limit);
    }

    async atualizarConfiguracao2FA(pessoaId: number, habilitado: boolean): Promise<any> {
        const pessoa = await this.configRepository.findPessoaById(pessoaId);
        if (!pessoa) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        let configuracao = await this.configRepository.findConfiguracao2FAByPessoaId(pessoaId);

        if (!configuracao) {
            configuracao = {
                pessoa_id: pessoaId,
                habilitado,
                codigo_2fa: habilitado ? this.gerarSecret2FA() : null,
                tentativas_login: 0,
                bloqueado_ate: null,
            };
        } else {
            configuracao.habilitado = habilitado;
            if (habilitado && !configuracao.codigo_2fa) {
                configuracao.codigo_2fa = this.gerarSecret2FA();
            }
        }

        await this.configRepository.saveConfiguracaoSeguranca(configuracao);

        // Log de auditoria
        await this.configRepository.saveLogAuditoria({
            pessoa_id: pessoaId,
            acao: habilitado ? 'HABILITAR_2FA' : 'DESABILITAR_2FA',
            detalhes: JSON.stringify({ habilitado, mensagem: `2FA ${habilitado ? 'habilitado' : 'desabilitado'}` }),
            ip_address: '',
            user_agent: '',
        });

        return {
            habilitado: configuracao.habilitado,
            codigo_2fa: configuracao.codigo_2fa,
        };
    }

    async gerarQRCode2FA(pessoaId: number): Promise<string> {
        const pessoa = await this.configRepository.findPessoaById(pessoaId);
        if (!pessoa) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        const configuracao = await this.configRepository.findConfiguracao2FAByPessoaId(pessoaId);
        if (!configuracao || !configuracao.habilitado || !configuracao.codigo_2fa) {
            throw new AppError('2FA não está habilitado para este usuário.', 400);
        }

        // Gerar URL do TOTP para o QR code
        const otpauthUrl = speakeasy.otpauthURL({
            secret: configuracao.codigo_2fa,
            label: `ConsumaJa:${pessoa.pessoa_email}`,
            issuer: 'ConsumaJa',
            encoding: 'base32'
        });

        // Gerar QR code como data URL
        const qrCodeDataURL = await qrcode.toDataURL(otpauthUrl);
        return qrCodeDataURL;
    }

    async validarCodigo2FA(pessoaId: number, codigo: string): Promise<boolean> {
        const configuracao = await this.configRepository.findConfiguracao2FAByPessoaId(pessoaId);
        if (!configuracao || !configuracao.habilitado || !configuracao.codigo_2fa) {
            return false;
        }

        // Verificar se o código TOTP é válido
        const verificado = speakeasy.totp.verify({
            secret: configuracao.codigo_2fa,
            encoding: 'base32',
            token: codigo,
            window: 2 // Permitir uma janela de 2 códigos (30 segundos antes/depois)
        });

        if (verificado) {
            // Resetar tentativas de falha em caso de sucesso
            await this.configRepository.saveConfiguracaoSeguranca({
                ...configuracao,
                tentativas_login: 0,
                bloqueado_ate: null
            });
        } else {
            // Incrementar tentativas de falha
            const tentativas = (configuracao.tentativas_login || 0) + 1;
            let bloqueadoAte = null;

            // Bloquear por 15 minutos após 5 tentativas falhidas
            if (tentativas >= 5) {
                bloqueadoAte = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
            }

            await this.configRepository.saveConfiguracaoSeguranca({
                ...configuracao,
                tentativas_login: tentativas,
                bloqueado_ate: bloqueadoAte
            });
        }

        return verificado;
    }

    private gerarSecret2FA(): string {
        // Gerar segredo TOTP de 32 caracteres (base32)
        return speakeasy.generateSecret({ length: 32 }).base32;
    }

    async is2FAEnabled(pessoaId: number): Promise<boolean> {
        const configuracao = await this.configRepository.findConfiguracao2FAByPessoaId(pessoaId);
        return configuracao?.habilitado || false;
    }

    async is2FABlocked(pessoaId: number): Promise<{ blocked: boolean; minutesRemaining?: number }> {
        const configuracao = await this.configRepository.findConfiguracao2FAByPessoaId(pessoaId);
        if (!configuracao?.bloqueado_ate) {
            return { blocked: false };
        }

        const blockedUntil = new Date(configuracao.bloqueado_ate);
        const now = new Date();
        const blocked = blockedUntil > now;

        if (blocked) {
            const minutesRemaining = Math.ceil((blockedUntil.getTime() - now.getTime()) / (1000 * 60));
            return { blocked: true, minutesRemaining };
        }

        return { blocked: false };
    }
}