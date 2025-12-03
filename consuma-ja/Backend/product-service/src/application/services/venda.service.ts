import { Venda } from '../../domain/entities/venda.entity';
import { VendaRepository, CreateVendaRepoData } from '../../domain/repositories/venda.repository';
import { PromocaoRepository } from '../../domain/repositories/promocao.repository';
import { LoteProdRepository } from '../../domain/repositories/loteprod.repository';
import { AppError } from '../../common/errors/app-error';
import { CreateVendaDto } from '../../interfaces/dtos/create-venda.dto';

export class VendaService {
  constructor(
    private vendaRepository: VendaRepository,
    private promocaoRepository: PromocaoRepository,
    private loteProdRepository: LoteProdRepository
  ) {}

  async criarVenda(dto: CreateVendaDto): Promise<Venda> {
    if (!dto.itens || dto.itens.length === 0) {
      throw new AppError('A venda deve conter ao menos um item.', 400);
    }

    const promocaoIds = Array.from(new Set(dto.itens.map(item => item.promocao_id)));
    if (promocaoIds.length === 0) {
      throw new AppError('Os itens informados não estão vinculados a uma promoção válida.', 400);
    }
    if (promocaoIds.length > 1) {
      throw new AppError('Todos os itens devem pertencer à mesma promoção.', 400);
    }
    const promocaoId = promocaoIds[0];
    const promocaoDetalhada = await this.promocaoRepository.buscarPorIdComItens(promocaoId, false);
    if (!promocaoDetalhada) {
      throw new AppError(`Promoção ${promocaoId} não encontrada ou inativa.`, 400);
    }
    if (!promocaoDetalhada.itens || promocaoDetalhada.itens.length === 0) {
      throw new AppError('A promoção selecionada não possui itens ativos.', 400);
    }
    const fornecedorId = promocaoDetalhada.JURIDICA_PESSOA_pessoa_id || promocaoDetalhada.fornecedor?.pessoa_id;
    if (!fornecedorId) {
      throw new AppError('Não foi possível identificar o fornecedor da promoção.', 400);
    }

    // Validar itens
    for (const item of dto.itens) {
      // Verificar lote
      const lote = await this.loteProdRepository.buscarPorId(item.lote_id, true);
      if (!lote) throw new AppError(`Lote ${item.lote_id} não encontrado.`, 400);

      // Verificar se lote está em promoção ativa
      const itemPromocao = promocaoDetalhada.itens?.find(i => i.LOTEPROD_lote_id === item.lote_id);
      if (!itemPromocao) throw new AppError(`Lote ${item.lote_id} não está na promoção ${item.promocao_id}.`, 400);

      // Verificar valor_unitario
      if (itemPromocao.itemPromocao_valor !== item.valor_unitario) {
        throw new AppError(`Valor unitário para lote ${item.lote_id} não corresponde à promoção.`, 400);
      }

      // Verificar quantidade disponível
      if (lote.lote_quantidade_atual < item.quantidade) {
        throw new AppError(`Estoque insuficiente para lote ${item.lote_id}.`, 400);
      }
    }

    // Calcular totais se não fornecidos
    const quantidadeTotal = dto.quantidade_total_itens || dto.itens.reduce((sum, item) => sum + item.quantidade, 0);
    const valorTotal = dto.valor_total || dto.itens.reduce((sum, item) => sum + (item.quantidade * item.valor_unitario), 0);

    const retiradaNoFornecedor = Boolean(dto.retirada_no_fornecedor);
    if (!retiradaNoFornecedor && (!dto.endereco_id || dto.endereco_id <= 0)) {
      throw new AppError('Selecione um endereço válido para entrega.', 400);
    }

    const pagamentoPayload: Record<string, any> | undefined = (dto as any)?.pagamento;
    const metodoPagamento = dto.metodo_pagamento || pagamentoPayload?.metodo || null;
    const parcelas = dto.parcelas ?? pagamentoPayload?.parcelas ?? 1;
    const detalhesPagamento = dto.detalhes_pagamento || pagamentoPayload || null;

    const dataParaRepo: CreateVendaRepoData = {
      venda_data: dto.data_venda ? new Date(dto.data_venda) : new Date(),
      venda_total: valorTotal,
      promocao_id: promocaoId,
      fornecedor_pessoa_id: fornecedorId,
      pessoa_id: dto.pessoa_id,
      endereco_id: retiradaNoFornecedor ? null : dto.endereco_id ?? null,
      retirada_no_fornecedor: retiradaNoFornecedor,
      metodo_pagamento: metodoPagamento,
      parcelas,
      detalhes_pagamento: detalhesPagamento,
      itens: dto.itens.map(item => ({
        lote_id: item.lote_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario
      }))
    };

    try {
      return await this.vendaRepository.criar(dataParaRepo);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('[Service Venda] Erro criar venda:', error);
      throw new AppError('Erro interno ao criar venda.', 500, false);
    }
  }
}