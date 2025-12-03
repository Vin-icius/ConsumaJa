import { AppError } from '../../common/errors/app-error';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { encrypt, decrypt } from '../../common/utils/encryption.util';
import { ConfigMySQLRepository } from '../../infrastructure/repositories/config.mysql.repository';

interface AtualizarNotificacoesDto {
  email_notificacoes?: boolean;
  sms_notificacoes?: boolean;
  marketing_notificacoes?: boolean;
  push_notificacoes?: boolean;
}

interface AlterarSenhaDto {
  senha_atual: string;
  nova_senha: string;
  confirmar_senha: string;
}

interface AdicionarMetodoPagamentoDto {
  tipo: string;
  numero_cartao?: string;
  nome_cartao?: string;
  data_validade?: string;
  cvv?: string;
  chave_pix?: string;
  email_paypal?: string;
}

interface AtualizarMetodoPagamentoDto {
  tipo?: string;
  numero_cartao?: string;
  nome_cartao?: string;
  data_validade?: string;
  cvv?: string;
  chave_pix?: string;
  email_paypal?: string;
}

interface AtualizarConfigPagamentoFornecedorDto {
  maxParcelas?: number;
  max_parcelas?: number;
  parcelasSemJuros?: number;
  parcelas_sem_juros?: number;
  valorMinimoParcela?: number | null;
  valor_min_parcela?: number | null;
  jurosPercentual?: number | null;
  juros_percentual?: number | null;
}

export class ConfigService {
  constructor(private readonly configRepository: ConfigMySQLRepository) {}

  private readonly tipoLabels: Record<string, string> = {
    cartao_credito: 'Cartão de crédito',
    cartao_debito: 'Cartão de débito',
    pix: 'PIX',
    paypal: 'PayPal',
    boleto: 'Boleto bancário',
  };

  private normalizeTipoPagamento(tipo: string | undefined): string {
    const normalized = (tipo ?? '').toString().trim().toLowerCase();

    switch (normalized) {
      case 'credito':
      case 'cartao_credito':
      case 'cartão_credito':
      case 'cartão':
      case 'cartao':
      case 'cartao-credito':
      case 'card':
      case 'credit':
      case 'credit_card':
        return 'cartao_credito';
      case 'debito':
      case 'cartao_debito':
      case 'cartão_debito':
      case 'debit':
      case 'debit_card':
      case 'cartao-debito':
        return 'cartao_debito';
      case 'pix':
        return 'pix';
      case 'paypal':
        return 'paypal';
      case 'boleto':
      case 'boleto_bancario':
        return 'boleto';
      default:
        throw new AppError('Tipo de pagamento inválido. Use: CARTAO, CREDITO, DEBITO, PIX, PAYPAL ou BOLETO.', 400);
    }
  }

  private sanitizeNumeroCartao(numero: string | undefined): string {
    return (numero ?? '').replace(/\D/g, '');
  }

  private sanitizeCvv(cvv: string | undefined): string {
    return (cvv ?? '').replace(/\D/g, '');
  }

  private maskPixKey(key: string | null | undefined): string | null {
    if (!key) {
      return null;
    }

    const trimmed = key.trim();
    if (trimmed.length <= 4) {
      return '••••';
    }

    const start = trimmed.slice(0, 3);
    const end = trimmed.slice(-3);
    return `${start}••••${end}`;
  }

  private getTituloTipo(tipo: string): string {
    return this.tipoLabels[tipo] ?? 'Método de pagamento';
  }

  private mapMetodoPagamento(metodo: {
    id?: number;
    tipo: string;
    numero_cartao?: string | null;
    nome_cartao?: string | null;
    data_validade?: string | null;
    chave_pix?: string | null;
    email_paypal?: string | null;
    principal: boolean;
  }) {
    const tipoNormalizado = metodo.tipo?.toLowerCase() ?? 'desconhecido';
    const titulo = this.getTituloTipo(tipoNormalizado);
    let numeroFinal: string | null = null;

    if (metodo.numero_cartao) {
      try {
        const decrypted = decrypt(metodo.numero_cartao);
        numeroFinal = decrypted.slice(-4);
      } catch (error) {
        console.warn('[ConfigService] Falha ao descriptografar número do cartão.', error);
      }
    }

    const pixChaveMascarada = this.maskPixKey(metodo.chave_pix ?? null);

    let detalhe = 'Método cadastrado';
    switch (tipoNormalizado) {
      case 'cartao_credito':
      case 'cartao_debito':
        detalhe = numeroFinal ? `Final ${numeroFinal}` : 'Cartão salvo';
        break;
      case 'pix':
        detalhe = pixChaveMascarada ? `Chave ${pixChaveMascarada}` : 'Chave PIX cadastrada';
        break;
      case 'paypal':
        detalhe = metodo.email_paypal ?? 'Conta PayPal';
        break;
      case 'boleto':
        detalhe = 'Boleto bancário';
        break;
    }

    return {
      id: metodo.id!,
      tipo: tipoNormalizado,
      titulo,
      detalhe,
      principal: Boolean(metodo.principal),
      numero_final: numeroFinal,
      nome_cartao: metodo.nome_cartao ?? null,
      data_validade: metodo.data_validade ?? null,
      pix_chave: pixChaveMascarada,
      email_paypal: metodo.email_paypal ?? null,
    };
  }

  private async listarMetodosSanitizados(pessoaId: number) {
    const metodos = await this.configRepository.findMetodosPagamentoByPessoaId(pessoaId);
    return metodos.map((metodo) => this.mapMetodoPagamento(metodo));
  }

  async getConfiguracoesUsuario(pessoaId: number) {
    const pessoa = await this.configRepository.findPessoaById(pessoaId);

    if (!pessoa) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const [notificacoes, configuracao2FA] = await Promise.all([
      this.configRepository.findNotificacoesByPessoaId(pessoaId),
      this.configRepository.findConfiguracao2FAByPessoaId(pessoaId),
    ]);

    const metodosPagamento = await this.listarMetodosSanitizados(pessoaId);

    return {
      notificacoes: notificacoes || {
        pessoa_id: pessoaId,
        email_notificacoes: true,
        sms_notificacoes: false,
        marketing_notificacoes: true,
        push_notificacoes: true,
      },
      metodos_pagamento: metodosPagamento,
      autenticacao_2fa: configuracao2FA?.habilitado ?? false,
    };
  }

  async atualizarNotificacoes(pessoaId: number, dto: AtualizarNotificacoesDto) {
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
      notificacoes.email_notificacoes = dto.email_notificacoes ?? notificacoes.email_notificacoes;
      notificacoes.sms_notificacoes = dto.sms_notificacoes ?? notificacoes.sms_notificacoes;
      notificacoes.marketing_notificacoes = dto.marketing_notificacoes ?? notificacoes.marketing_notificacoes;
      notificacoes.push_notificacoes = dto.push_notificacoes ?? notificacoes.push_notificacoes;
    }

    const saved = await this.configRepository.saveNotificacoes(notificacoes);

    await this.configRepository.saveLogAuditoria({
      pessoa_id: pessoaId,
      acao: 'ATUALIZAR_NOTIFICACOES',
      detalhes: JSON.stringify(dto),
      ip_address: null,
      user_agent: null,
    });

    return saved;
  }

  async alterarSenha(pessoaId: number, dto: AlterarSenhaDto): Promise<void> {
    const pessoa = await this.configRepository.findPessoaById(pessoaId);

    if (!pessoa) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    if (!pessoa.pessoa_senha) {
      throw new AppError('Senha atual não configurada para este usuário.', 400);
    }

    const senhaCorreta = await bcrypt.compare(dto.senha_atual, pessoa.pessoa_senha);

    if (!senhaCorreta) {
      throw new AppError('Senha atual incorreta.', 400);
    }

    const novaSenhaIgual = await bcrypt.compare(dto.nova_senha, pessoa.pessoa_senha);

    if (novaSenhaIgual) {
      throw new AppError('A nova senha deve ser diferente da senha atual.', 400);
    }

    if (dto.nova_senha !== dto.confirmar_senha) {
      throw new AppError('A confirmação da senha não corresponde.', 400);
    }

    const hashedPassword = await bcrypt.hash(dto.nova_senha, 12);

    await this.configRepository.updatePessoaSenha(pessoaId, hashedPassword);

    await this.configRepository.saveLogAuditoria({
      pessoa_id: pessoaId,
      acao: 'ALTERAR_SENHA',
      detalhes: JSON.stringify({ mensagem: 'Senha alterada com sucesso' }),
      ip_address: null,
      user_agent: null,
    });

    await this.configRepository.updateSessoesByPessoaId(pessoaId, { ativo: 0 });
  }

  async adicionarMetodoPagamento(pessoaId: number, dto: AdicionarMetodoPagamentoDto) {
    const pessoa = await this.configRepository.findPessoaById(pessoaId);

    if (!pessoa) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const metodosExistentes = await this.configRepository.findMetodosPagamentoByPessoaId(pessoaId);
    const possuiPrincipal = metodosExistentes.some((m) => m.principal);
    const tipoNormalizado = this.normalizeTipoPagamento(dto.tipo);

    const metodoParaSalvar = {
      pessoa_id: pessoaId,
      tipo: tipoNormalizado,
      numero_cartao: null as string | null,
      nome_cartao: null as string | null,
      data_validade: null as string | null,
      cvv: null as string | null,
      chave_pix: null as string | null,
      email_paypal: null as string | null,
      principal: possuiPrincipal ? false : true,
    };

    if (tipoNormalizado === 'cartao_credito' || tipoNormalizado === 'cartao_debito') {
      if (!dto.numero_cartao || !dto.nome_cartao || !dto.data_validade) {
        throw new AppError('Campos obrigatórios para cartão não fornecidos.', 400);
      }

      const numeroSanitizado = this.sanitizeNumeroCartao(dto.numero_cartao);
      if (numeroSanitizado.length < 13) {
        throw new AppError('Número do cartão inválido.', 400);
      }

      metodoParaSalvar.numero_cartao = encrypt(numeroSanitizado);
      metodoParaSalvar.nome_cartao = dto.nome_cartao.trim();
      metodoParaSalvar.data_validade = dto.data_validade.trim();
      metodoParaSalvar.cvv = dto.cvv ? encrypt(this.sanitizeCvv(dto.cvv)) : null;
    } else if (tipoNormalizado === 'pix') {
      if (!dto.chave_pix) {
        throw new AppError('Chave PIX é obrigatória para pagamentos PIX.', 400);
      }
      metodoParaSalvar.chave_pix = dto.chave_pix.trim();
    } else if (tipoNormalizado === 'paypal') {
      if (!dto.email_paypal) {
        throw new AppError('Email PayPal é obrigatório para pagamentos PayPal.', 400);
      }
      metodoParaSalvar.email_paypal = dto.email_paypal.trim();
    }

    const saved = await this.configRepository.saveMetodoPagamento(metodoParaSalvar);

    if (metodoParaSalvar.principal) {
      await this.configRepository.setMetodoPagamentoPrincipal(pessoaId, saved.id!);
    }

    await this.configRepository.saveLogAuditoria({
      pessoa_id: pessoaId,
      acao: 'ADICIONAR_METODO_PAGAMENTO',
      detalhes: JSON.stringify({ tipo: tipoNormalizado }),
      ip_address: null,
      user_agent: null,
    });

    const metodoPersistido = await this.configRepository.findMetodoPagamentoById(saved.id!, pessoaId);
    return metodoPersistido ? this.mapMetodoPagamento(metodoPersistido) : this.mapMetodoPagamento({
      ...metodoParaSalvar,
      id: saved.id!,
    });
  }

  async listarMetodosPagamento(pessoaId: number) {
    return this.listarMetodosSanitizados(pessoaId);
  }

  async atualizarMetodoPagamento(pessoaId: number, pagamentoId: number, dto: AtualizarMetodoPagamentoDto) {
    const pessoa = await this.configRepository.findPessoaById(pessoaId);
    if (!pessoa) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const metodo = await this.configRepository.findMetodoPagamentoById(pagamentoId, pessoaId);
    if (!metodo) {
      throw new AppError('Método de pagamento não encontrado.', 404);
    }

    const tipoNormalizado = dto.tipo ? this.normalizeTipoPagamento(dto.tipo) : metodo.tipo;

    const metodoAtualizado = {
      ...metodo,
      tipo: tipoNormalizado,
    };

    if (tipoNormalizado === 'cartao_credito' || tipoNormalizado === 'cartao_debito') {
      if (dto.numero_cartao) {
        const numeroSanitizado = this.sanitizeNumeroCartao(dto.numero_cartao);
        if (numeroSanitizado.length < 13) {
          throw new AppError('Número do cartão inválido.', 400);
        }
        metodoAtualizado.numero_cartao = encrypt(numeroSanitizado);
      }

      if (dto.nome_cartao !== undefined) {
        if (!dto.nome_cartao.trim()) {
          throw new AppError('Nome impresso no cartão é obrigatório.', 400);
        }
        metodoAtualizado.nome_cartao = dto.nome_cartao.trim();
      }

      if (dto.data_validade !== undefined) {
        if (!dto.data_validade.trim()) {
          throw new AppError('Data de validade é obrigatória.', 400);
        }
        metodoAtualizado.data_validade = dto.data_validade.trim();
      }

      if (dto.cvv) {
        const cvvSanitizado = this.sanitizeCvv(dto.cvv);
        if (cvvSanitizado.length < 3) {
          throw new AppError('CVV inválido.', 400);
        }
        metodoAtualizado.cvv = encrypt(cvvSanitizado);
      }

      if (!metodoAtualizado.numero_cartao || !metodoAtualizado.nome_cartao || !metodoAtualizado.data_validade) {
        throw new AppError('Dados obrigatórios do cartão incompletos.', 400);
      }

      metodoAtualizado.chave_pix = null;
      metodoAtualizado.email_paypal = null;
    } else if (tipoNormalizado === 'pix') {
      if (dto.chave_pix !== undefined) {
        if (!dto.chave_pix.trim()) {
          throw new AppError('Chave PIX é obrigatória para este método.', 400);
        }
        metodoAtualizado.chave_pix = dto.chave_pix.trim();
      }

      if (!metodoAtualizado.chave_pix) {
        throw new AppError('Chave PIX é obrigatória para este método.', 400);
      }

      metodoAtualizado.numero_cartao = null;
      metodoAtualizado.nome_cartao = null;
      metodoAtualizado.data_validade = null;
      metodoAtualizado.cvv = null;
      metodoAtualizado.email_paypal = null;
    } else if (tipoNormalizado === 'paypal') {
      if (dto.email_paypal !== undefined) {
        if (!dto.email_paypal.trim()) {
          throw new AppError('Email PayPal é obrigatório para este método.', 400);
        }
        metodoAtualizado.email_paypal = dto.email_paypal.trim();
      }

      if (!metodoAtualizado.email_paypal) {
        throw new AppError('Email PayPal é obrigatório para este método.', 400);
      }

      metodoAtualizado.numero_cartao = null;
      metodoAtualizado.nome_cartao = null;
      metodoAtualizado.data_validade = null;
      metodoAtualizado.cvv = null;
      metodoAtualizado.chave_pix = null;
    } else {
      metodoAtualizado.numero_cartao = null;
      metodoAtualizado.nome_cartao = null;
      metodoAtualizado.data_validade = null;
      metodoAtualizado.cvv = null;
      metodoAtualizado.chave_pix = null;
      metodoAtualizado.email_paypal = null;
    }

    await this.configRepository.saveMetodoPagamento(metodoAtualizado);

    await this.configRepository.saveLogAuditoria({
      pessoa_id: pessoaId,
      acao: 'ATUALIZAR_METODO_PAGAMENTO',
      detalhes: JSON.stringify({ pagamentoId, tipo: tipoNormalizado }),
      ip_address: null,
      user_agent: null,
    });

    const metodoPersistido = await this.configRepository.findMetodoPagamentoById(pagamentoId, pessoaId);
    return metodoPersistido ? this.mapMetodoPagamento(metodoPersistido) : this.mapMetodoPagamento({
      ...metodoAtualizado,
      id: pagamentoId,
    });
  }

  async definirMetodoPagamentoPrincipal(pessoaId: number, pagamentoId: number) {
    const pessoa = await this.configRepository.findPessoaById(pessoaId);
    if (!pessoa) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const metodo = await this.configRepository.findMetodoPagamentoById(pagamentoId, pessoaId);
    if (!metodo) {
      throw new AppError('Método de pagamento não encontrado.', 404);
    }

    const atualizado = await this.configRepository.setMetodoPagamentoPrincipal(pessoaId, pagamentoId);
    if (!atualizado) {
      throw new AppError('Não foi possível definir o método como principal.', 400);
    }

    await this.configRepository.saveLogAuditoria({
      pessoa_id: pessoaId,
      acao: 'DEFINIR_METODO_PAGAMENTO_PADRAO',
      detalhes: JSON.stringify({ pagamentoId }),
      ip_address: null,
      user_agent: null,
    });

    return this.listarMetodosSanitizados(pessoaId);
  }

  async removerMetodoPagamento(pessoaId: number, pagamentoId: number): Promise<void> {
    const metodo = await this.configRepository.findMetodoPagamentoById(pagamentoId, pessoaId);

    if (!metodo) {
      throw new AppError('Método de pagamento não encontrado.', 404);
    }

    await this.configRepository.removeMetodoPagamento(metodo);

    if (metodo.principal) {
      const restantes = await this.configRepository.findMetodosPagamentoByPessoaId(pessoaId);

      if (restantes.length > 0) {
        const [proximo] = restantes;
        await this.configRepository.setMetodoPagamentoPrincipal(pessoaId, proximo.id!);
      }
    }

    await this.configRepository.saveLogAuditoria({
      pessoa_id: pessoaId,
      acao: 'REMOVER_METODO_PAGAMENTO',
      detalhes: JSON.stringify({ pagamentoId }),
      ip_address: null,
      user_agent: null,
    });
  }

  async getHistoricoPagamentos(pessoaId: number, page = 1, limit = 10) {
    return this.configRepository.findHistoricoPagamentosByPessoaId(pessoaId, page, limit);
  }

  async atualizarConfiguracao2FA(pessoaId: number, habilitado: boolean) {
    const pessoa = await this.configRepository.findPessoaById(pessoaId);

    if (!pessoa) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const configuracaoExistente = await this.configRepository.findConfiguracao2FAByPessoaId(pessoaId);

    if (!habilitado) {
      if (configuracaoExistente) {
        await this.configRepository.deleteConfiguracaoSeguranca(pessoaId);
      }

      await this.configRepository.saveLogAuditoria({
        pessoa_id: pessoaId,
        acao: 'DESABILITAR_2FA',
        detalhes: JSON.stringify({ habilitado: false }),
        ip_address: null,
        user_agent: null,
      });

      return {
        habilitado: false,
        codigo_2fa: null,
      };
    }

    const segredo = configuracaoExistente?.codigo_2fa ?? this.gerarSecret2FA();

    const configuracao = await this.configRepository.saveConfiguracaoSeguranca({
      id: configuracaoExistente?.id,
      pessoa_id: pessoaId,
      habilitado: true,
      codigo_2fa: segredo,
      tentativas_login: 0,
      bloqueado_ate: null,
      senha_temporaria: 0,
    });

    await this.configRepository.saveLogAuditoria({
      pessoa_id: pessoaId,
      acao: configuracaoExistente ? 'ATUALIZAR_2FA' : 'HABILITAR_2FA',
      detalhes: JSON.stringify({ habilitado: true }),
      ip_address: null,
      user_agent: null,
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

    const otpauthUrl = speakeasy.otpauthURL({
      secret: configuracao.codigo_2fa,
      label: `ConsumaJa:${pessoa.pessoa_email}`,
      issuer: 'ConsumaJa',
      encoding: 'base32',
    });

    return qrcode.toDataURL(otpauthUrl);
  }

  async validarCodigo2FA(pessoaId: number, codigo: string): Promise<boolean> {
    const configuracao = await this.configRepository.findConfiguracao2FAByPessoaId(pessoaId);

    if (!configuracao || !configuracao.habilitado || !configuracao.codigo_2fa) {
      return false;
    }

    const verificado = speakeasy.totp.verify({
      secret: configuracao.codigo_2fa,
      encoding: 'base32',
      token: codigo,
      window: 2,
    });

    if (verificado) {
      configuracao.tentativas_login = 0;
      configuracao.bloqueado_ate = null;
    } else {
      const tentativas = (configuracao.tentativas_login ?? 0) + 1;
      configuracao.tentativas_login = tentativas;

      if (tentativas >= 5) {
        configuracao.bloqueado_ate = new Date(Date.now() + 15 * 60 * 1000);
      }
    }

    await this.configRepository.saveConfiguracaoSeguranca(configuracao);

    return verificado;
  }

  gerarSecret2FA(): string {
    return speakeasy.generateSecret({ length: 32 }).base32;
  }

  async is2FAEnabled(pessoaId: number): Promise<boolean> {
    const configuracao = await this.configRepository.findConfiguracao2FAByPessoaId(pessoaId);
    return configuracao?.habilitado ?? false;
  }

  async is2FABlocked(pessoaId: number): Promise<{ blocked: boolean; minutesRemaining?: number }> {
    const configuracao = await this.configRepository.findConfiguracao2FAByPessoaId(pessoaId);

    if (!configuracao?.bloqueado_ate) {
      return { blocked: false };
    }

    const blockedUntil = new Date(configuracao.bloqueado_ate);
    const now = new Date();

    if (blockedUntil > now) {
      const minutesRemaining = Math.ceil((blockedUntil.getTime() - now.getTime()) / (1000 * 60));
      return { blocked: true, minutesRemaining };
    }

    return { blocked: false };
  }

  async getConfiguracaoPagamentoFornecedor(fornecedorId: number) {
    const fornecedor = await this.configRepository.findPessoaById(fornecedorId);

    if (!fornecedor) {
      throw new AppError('Fornecedor não encontrado.', 404);
    }

    if (fornecedor.pessoa_tipo !== 'Juridica') {
      throw new AppError('Configuração de pagamento disponível apenas para fornecedores.', 400);
    }

    const config = await this.configRepository.findFornecedorPagamentoConfig(fornecedorId);

    const maxParcelas = Number(config?.max_parcelas ?? 3) || 3;
    const parcelasSemJuros = Math.min(Number(config?.parcelas_sem_juros ?? 1) || 1, maxParcelas);
    const valorMinimoParcela = config?.valor_min_parcela ?? null;
    const jurosPercentual = config?.juros_percentual ?? null;

    return {
      fornecedorId,
      maxParcelas,
      max_parcelas: maxParcelas,
      parcelasSemJuros,
      parcelas_sem_juros: parcelasSemJuros,
      valorMinimoParcela,
      valor_min_parcela: valorMinimoParcela,
      jurosPercentual,
      juros_percentual: jurosPercentual,
      atualizadoEm: config?.atualizado_em ?? null,
    };
  }

  async salvarConfiguracaoPagamentoFornecedor(
    fornecedorId: number,
    dto: AtualizarConfigPagamentoFornecedorDto,
  ) {
    const fornecedor = await this.configRepository.findPessoaById(fornecedorId);

    if (!fornecedor) {
      throw new AppError('Fornecedor não encontrado.', 404);
    }

    if (fornecedor.pessoa_tipo !== 'Juridica') {
      throw new AppError('Configuração de pagamento disponível apenas para fornecedores.', 400);
    }

    const maxParcelasRaw = dto.maxParcelas ?? dto.max_parcelas ?? 3;
    const maxParcelasNumber = Number(maxParcelasRaw);
    const maxParcelas = Math.min(
      Math.max(Number.isFinite(maxParcelasNumber) ? Math.floor(maxParcelasNumber) : 3, 1),
      24,
    );

    const parcelasSemJurosRaw = dto.parcelasSemJuros ?? dto.parcelas_sem_juros ?? maxParcelas;
    const parcelasSemJurosNumber = Number(parcelasSemJurosRaw);
    const parcelasSemJuros = Math.min(
      Math.max(Number.isFinite(parcelasSemJurosNumber) ? Math.floor(parcelasSemJurosNumber) : maxParcelas, 1),
      maxParcelas,
    );

    const valorMinimoParcela = dto.valorMinimoParcela ?? dto.valor_min_parcela ?? null;
    const valorMinParcelaNumber =
      valorMinimoParcela === null || valorMinimoParcela === undefined
        ? null
        : Number(valorMinimoParcela);
    if (valorMinParcelaNumber !== null) {
      if (Number.isNaN(valorMinParcelaNumber)) {
        throw new AppError('Valor mínimo por parcela inválido.', 400);
      }
      if (valorMinParcelaNumber < 0) {
      throw new AppError('Valor mínimo por parcela não pode ser negativo.', 400);
      }
    }

    const jurosPercentual = dto.jurosPercentual ?? dto.juros_percentual ?? null;
    const jurosPercentualNumber =
      jurosPercentual === null || jurosPercentual === undefined ? null : Number(jurosPercentual);
    if (jurosPercentualNumber !== null) {
      if (Number.isNaN(jurosPercentualNumber)) {
        throw new AppError('Percentual de juros inválido.', 400);
      }
      if (jurosPercentualNumber < 0) {
        throw new AppError('Percentual de juros não pode ser negativo.', 400);
      }
    }

    await this.configRepository.saveFornecedorPagamentoConfig({
      fornecedor_pessoa_id: fornecedorId,
      max_parcelas: maxParcelas,
      parcelas_sem_juros: parcelasSemJuros,
      valor_min_parcela: valorMinParcelaNumber,
      juros_percentual: jurosPercentualNumber,
    });

    await this.configRepository.saveLogAuditoria({
      pessoa_id: fornecedorId,
      acao: 'ATUALIZAR_CONFIG_PAGAMENTO_FORNECEDOR',
      detalhes: JSON.stringify({ maxParcelas, parcelasSemJuros, valorMinimoParcela: valorMinParcelaNumber, jurosPercentual: jurosPercentualNumber }),
      ip_address: null,
      user_agent: null,
    });

    return this.getConfiguracaoPagamentoFornecedor(fornecedorId);
  }
}
