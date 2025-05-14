import { Promocao } from "../../domain/entities/promocao.entity";
import { PromocaoRepository, CreatePromocaoRepoData, UpdatePromocaoRepoData } from "../../domain/repositories/promocao.repository";
import { AppError } from "../../common/errors/app-error";
import { CreatePromocaoDto } from "../../interfaces/dtos/create-promocao.dto";
import { UpdatePromocaoDto } from "../../interfaces/dtos/update-promocao.dto";
import { ListarPromocoesQueryDto } from "../../interfaces/dtos/listar-promocoes-query.dto";
import { LoteProdRepository } from "../../domain/repositories/loteprod.repository";
import { LoteProdMySQLRepository } from "../../infrastructure/repositories/loteprod.mysql.repository";
import { ProdutoRepository } from "../../domain/repositories/produto.repository";

export class PromocaoService {
  constructor(
    private promocaoRepository: PromocaoRepository,
    private loteProdRepository: LoteProdMySQLRepository,
    private produtoRepository: ProdutoRepository
  ) {}

  private async validarItensPromocao(itens: Array<{ LOTEPROD_lote_id: number; itemPromocao_qtde: number, produto_id?: number }>): Promise<void> {
    if (!itens || itens.length === 0) throw new AppError("Promoção deve ter pelo menos um item.", 400);
    for (const item of itens) {
        if (!item.LOTEPROD_lote_id) throw new AppError(`ID do Lote é obrigatório.`, 400);
        const lote = await this.loteProdRepository.buscarPorId(item.LOTEPROD_lote_id, true); // Usa o repo
        if (!lote) { throw new AppError(`Lote ${item.LOTEPROD_lote_id} não encontrado/inativo.`, 400); }
        if (new Date(lote.lote_validade) < new Date()) { throw new AppError(`Lote ${lote.lote_codigo} vencido.`, 400); }
        if (lote.lote_quantidade_atual < item.itemPromocao_qtde) { throw new AppError(`Estoque insuficiente Lote ${lote.lote_codigo}. Disp: ${lote.lote_quantidade_atual}, Ofer: ${item.itemPromocao_qtde}.`, 400); }
    }
}


  async criarPromocao(dto: CreatePromocaoDto): Promise<Promocao> {
      await this.validarItensPromocao(dto.itens);

      const dataParaRepo: CreatePromocaoRepoData = {
          promocao_descricao: dto.promocao_descricao, // Passa direto
          JURIDICA_PESSOA_pessoa_id: dto.JURIDICA_PESSOA_pessoa_id, // Passa direto
          endereco_id: dto.endereco_id, // Passa direto
          // Converte datas de string para Date
          inicio: new Date(dto.inicio),
          fim: dto.fim ? new Date(dto.fim) : null,
          itens: dto.itens, // Já está no formato correto (CreateItemPromocaoDto[])
      };
      // -------------------------------------------
      try {
          return await this.promocaoRepository.criar(dataParaRepo);
      } catch (error) { /* ... tratamento genérico ... */ if(error instanceof AppError) throw error; console.error("[Service] Erro criar promoção:", error); throw new AppError("Erro interno ao criar promoção.", 500, false); }
  }

  async listarPromocoesAtivas(filtros: ListarPromocoesQueryDto): Promise<Promocao[]> {
    try {
        return await this.promocaoRepository.listar(filtros, true);
    } catch (error) { /* ... tratamento genérico ... */ if(error instanceof AppError) throw error; console.error("[Service] Erro listar promoções:", error); throw new AppError("Erro interno ao listar promoções.", 500, false); }
  }

  async getPromocaoDetalhes(id: number): Promise<Promocao> {
    try {
        const promocao = await this.promocaoRepository.buscarPorIdComItens(id, false); // Busca ativa
        if (!promocao) throw new AppError(`Promoção com ID ${id} não encontrada ou inativa.`, 404);
        return promocao;
    } catch (error) { /* ... tratamento genérico ... */ if(error instanceof AppError) throw error; console.error("[Service] Erro buscar detalhes promoção:", error); throw new AppError("Erro interno ao buscar detalhes.", 500, false); }
  }

  async atualizarPromocao(id: number, dto: UpdatePromocaoDto): Promise<Promocao> {
      await this.getPromocaoDetalhes(id); // Garante que existe e está ativa

      if (dto.itens) { // Se itens estão sendo atualizados, valida-os
          await this.validarItensPromocao(dto.itens);
      }

      // <<< CORREÇÃO na construção de dataParaRepo >>>
      const dataParaRepo: UpdatePromocaoRepoData = {
          // Passa apenas os campos definidos no DTO
          ...(dto.promocao_descricao !== undefined && { promocao_descricao: dto.promocao_descricao }),
          // Converte datas se fornecidas
          ...(dto.inicio && { inicio: new Date(dto.inicio) }),
          ...(dto.fim !== undefined && { fim: dto.fim ? new Date(dto.fim) : null }), // Permite setar fim para null
          // Itens são passados diretamente se existirem no DTO
          ...(dto.itens && { itens: dto.itens }),
      };
      // -------------------------------------------
      try {
          const promocaoAtualizada = await this.promocaoRepository.atualizar(id, dataParaRepo);
          if (!promocaoAtualizada) throw new AppError(`Promoção com ID ${id} não encontrada ou inativa para atualização.`, 404);
          return promocaoAtualizada;
      } catch (error) { /* ... tratamento genérico ... */ if(error instanceof AppError) throw error; console.error("[Service] Erro atualizar promoção:", error); throw new AppError("Erro interno ao atualizar promoção.", 500, false); }
  }

  async excluirPromocao(id: number): Promise<void> {
    try {
        const excluido = await this.promocaoRepository.excluir(id);
        if (!excluido) throw new AppError(`Promoção com ID ${id} não encontrada ou já está inativa.`, 404);
    } catch (error) { /* ... tratamento genérico ... */ if(error instanceof AppError) throw error; console.error("[Service] Erro excluir promoção:", error); throw new AppError("Erro interno ao excluir promoção.", 500, false); }
  }
}