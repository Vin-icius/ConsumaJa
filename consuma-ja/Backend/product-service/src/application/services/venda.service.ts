import { Venda } from '../../domain/entities/venda.entity';
import { VendaRepository, CreateVendaRepoData } from '../../domain/repositories/venda.repository';
import { PromocaoRepository } from '../../domain/repositories/promocao.repository';
import { LoteProdRepository } from '../../domain/repositories/loteprod.repository';
import { ShoppingCartRepository } from '../../domain/repositories/shopping-cart.repository';
import { AppError } from '../../common/errors/app-error';
import { CreateVendaDto } from '../../interfaces/dtos/create-venda.dto';

export class VendaService {
  constructor(
    private vendaRepository: VendaRepository,
    private promocaoRepository: PromocaoRepository,
    private loteProdRepository: LoteProdRepository,
    private cartRepository: ShoppingCartRepository,
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

    // Validar itens
    for (const item of dto.itens) {
      // Verificar lote
      const lote = await this.loteProdRepository.buscarPorId(item.lote_id, true);
      if (!lote) throw new AppError(`Lote ${item.lote_id} não encontrado.`, 400);

      // Verificar se lote está em promoção ativa
      const promocao = await this.promocaoRepository.buscarPorIdComItens(item.promocao_id, false);
      if (!promocao) throw new AppError(`Promoção ${item.promocao_id} não encontrada ou inativa.`, 400);

      const itemPromocao = promocao.itens?.find(i => i.LOTEPROD_lote_id === item.lote_id);
      if (!itemPromocao) throw new AppError(`Lote ${item.lote_id} não está na promoção ${item.promocao_id}.`, 400);

      // Verificar valor_unitario
      if (itemPromocao.itemPromocao_valor !== item.valor_unitario) {
        throw new AppError(`Valor unitário para lote ${item.lote_id} não corresponde à promoção.`, 400);
      }

      if (itemPromocao.itemPromocao_qtde < item.quantidade) {
        throw new AppError(`Quantidade solicitada excede o disponível na promoção para o lote ${item.lote_id}.`, 400);
      }

      // Verificar quantidade disponível
      if (lote.lote_quantidade_atual < item.quantidade) {
        throw new AppError(`Estoque insuficiente para lote ${item.lote_id}.`, 400);
      }
    }

    // Calcular totais se não fornecidos
    const quantidadeTotal = dto.quantidade_total_itens || dto.itens.reduce((sum, item) => sum + item.quantidade, 0);
    const valorTotal = dto.valor_total || dto.itens.reduce((sum, item) => sum + (item.quantidade * item.valor_unitario), 0);

    const dataParaRepo: CreateVendaRepoData = {
      venda_data: dto.data_venda ? new Date(dto.data_venda) : new Date(),
      venda_total: valorTotal,
      promocao_id: promocaoId,
      pessoa_id: dto.pessoa_id,
      endereco_id: dto.endereco_id,
      itens: dto.itens.map(item => ({
        lote_id: item.lote_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        promocao_id: item.promocao_id,
      }))
    };

    try {
      const venda = await this.vendaRepository.criar(dataParaRepo);
      if (dto.cart_item_ids && dto.cart_item_ids.length) {
        const cartItemIds = Array.from(new Set(dto.cart_item_ids.filter((id) => Number.isFinite(id) && id > 0)));
        if (cartItemIds.length) {
          await this.cartRepository.markItemsStatus(cartItemIds, dto.pessoa_id, 'PURCHASED');
        }
      }
      return venda;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('[Service Venda] Erro criar venda:', error);
      throw new AppError('Erro interno ao criar venda.', 500, false);
    }
  }
}