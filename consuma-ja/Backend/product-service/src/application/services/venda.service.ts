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
      pessoa_id: dto.pessoa_id,
      endereco_id: dto.endereco_id,
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