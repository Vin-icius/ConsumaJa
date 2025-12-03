import { LoteProd } from "../../domain/entities/loteprod.entity";
import { LoteProdRepository, ListarLotesDisponiveisFiltros, CreateLoteProdRepoData, UpdateLoteProdRepoData } from "../../domain/repositories/loteprod.repository";
import { CreateLoteProdDto } from "../../interfaces/dtos/create-loteprod.dto";
import { UpdateLoteProdDto } from "../../interfaces/dtos/update-loteprod.dto";
import { ListarLotesQueryDto } from "../../interfaces/dtos/listar-lotes-query.dto"; // Para listagem geral de lotes
import { ListarLotesDisponiveisQueryDto } from "../../interfaces/dtos/listar-lotesdisponiveis-query.dto"; // Para o picker da promoção
import { AppError } from "../../common/errors/app-error";
import { ProdutoRepository } from "../../domain/repositories/produto.repository";
import { PaginatedServiceResponse } from "./produto.service"; // Reutilizando o tipo de PaginatedServiceResponse

export class LoteProdService {
    constructor(
        private loteProdRepository: LoteProdRepository,
        private produtoRepository: ProdutoRepository
    ) {}

    async criarLote(dto: CreateLoteProdDto, contextoFornecedorId?: number): Promise<LoteProd> {
        console.log("[Service LoteProd] Criando lote para produto ID:", dto.produto_id);
        const produto = await this.produtoRepository.buscarPorId(dto.produto_id, true);
        if (!produto) {
            throw new AppError(`Produto com ID ${dto.produto_id} não encontrado ou inativo.`, 400);
        }
        if (produto.produto_status !== 'APROVADO') {
            throw new AppError(`Produto "${produto.produto_nome}" (ID: ${dto.produto_id}) não está APROVADO. Lotes só podem ser de produtos aprovados.`, 400);
        }

        if (contextoFornecedorId !== undefined && contextoFornecedorId !== null) {
            if (produto.fornecedor_pessoa_id !== contextoFornecedorId) {
                throw new AppError('Fornecedor não autorizado a criar lote para este produto.', 403);
            }
        }

        const fornecedorId = produto.fornecedor_pessoa_id;
        if (!fornecedorId) {
            throw new AppError('Produto não possui fornecedor associado.', 400);
        }

        const loteExistente = await this.loteProdRepository.findByCodigoAndProdutoId(dto.lote_codigo, dto.produto_id);
        if (loteExistente) {
            throw new AppError(`Já existe um lote com o código "${dto.lote_codigo}" para este produto.`, 409);
        }

        const validadeDate = new Date(dto.lote_validade);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
        if (validadeDate < hoje) {
             throw new AppError("Data de validade não pode ser no passado.", 400);
        }

        const dataRepo: CreateLoteProdRepoData = {
            ...dto,
            lote_validade: validadeDate,
            lote_quantidade_atual: dto.lote_quantidade_atual ?? dto.lote_quantidade_inicial,
            data_entrada: new Date(),
            ativo: true,
            fornecedor_pessoa_id: fornecedorId,
        };
        try {
            const novoLote = await this.loteProdRepository.criar(dataRepo);
            console.log("[Service LoteProd] Lote criado com ID:", novoLote.lote_id);
            return novoLote;
        } catch (error) {
            // <<< CORREÇÃO: Garantir que o catch lança um erro >>>
            if (error instanceof AppError) throw error;
            console.error("[Service LoteProd] Erro ao criar lote:", error);
            throw new AppError("Erro interno ao criar lote.", 500, false);
            // ----------------------------------------------------
        }
    }

    async listarLotes(filtrosDto: ListarLotesQueryDto): Promise<PaginatedServiceResponse<LoteProd>> {
        const page = filtrosDto.page || 1;
        const limit = filtrosDto.limit || 10;
        try {
            const { data, total } = await this.loteProdRepository.listar(filtrosDto);
            return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
        } catch (error) {
            // <<< CORREÇÃO >>>
            if (error instanceof AppError) throw error;
            console.error("[Service LoteProd] Erro ao listar lotes:", error);
            throw new AppError("Erro interno ao listar lotes.", 500, false);
            // -------------
        }
    }

    async buscarLotePorId(lote_id: number, apenasAtivo = true): Promise<LoteProd> { // Adicionado apenasAtivo
        try {
            const lote = await this.loteProdRepository.buscarPorId(lote_id, apenasAtivo);
            if (!lote) {
                throw new AppError(`Lote com ID ${lote_id} não encontrado ou ${apenasAtivo ? 'inativo' : 'não existente'}.`, 404);
            }
            return lote;
        } catch (error) {
             // <<< CORREÇÃO >>>
             if (error instanceof AppError) throw error;
             console.error(`[Service LoteProd] Erro ao buscar lote por ID ${lote_id}:`, error);
             throw new AppError("Erro interno ao buscar lote.", 500, false);
             // -------------
        }
    }

    async atualizarLote(lote_id: number, dto: UpdateLoteProdDto): Promise<LoteProd> {
        const loteExistente = await this.buscarLotePorId(lote_id, false); // Busca mesmo que inativo

        if (dto.lote_quantidade_atual !== undefined && dto.lote_quantidade_inicial !== undefined && dto.lote_quantidade_atual > dto.lote_quantidade_inicial) {
             throw new AppError("Quantidade atual não pode ser maior que a quantidade inicial.", 400);
        } else if (dto.lote_quantidade_atual !== undefined && loteExistente.lote_quantidade_inicial !== undefined && dto.lote_quantidade_atual > loteExistente.lote_quantidade_inicial) {
             throw new AppError("Quantidade atual não pode ser maior que a quantidade inicial original do lote.", 400);
        }

        // <<< CORREÇÃO NA CONSTRUÇÃO DE dataRepo >>>
        // Monta o objeto dataRepo explicitamente para garantir os tipos corretos,
        // especialmente para lote_validade.
        const dataRepo: UpdateLoteProdRepoData = {};

        if (dto.lote_validade !== undefined) {
            // Se lote_validade for uma string vazia ou null do DTO, converte para null Date
            // Se for uma string de data válida, converte para Date
            dataRepo.lote_validade = dto.lote_validade ? new Date(dto.lote_validade) : undefined;
             // Validação adicional da data (ex: não pode ser no passado se estiver atualizando)
             if (dataRepo.lote_validade) {
                 const hoje = new Date();
                 hoje.setHours(0,0,0,0);
                 if (new Date(dataRepo.lote_validade) < hoje) {
                     throw new AppError("Nova data de validade não pode ser no passado.", 400);
                 }
             }
        }
        if (dto.lote_quantidade_inicial !== undefined) {
            dataRepo.lote_quantidade_inicial = dto.lote_quantidade_inicial;
        }
        if (dto.lote_quantidade_atual !== undefined) {
            dataRepo.lote_quantidade_atual = dto.lote_quantidade_atual;
        }
        if (dto.ativo !== undefined) {
            dataRepo.ativo = dto.ativo;
        }
        // -------------------------------------------

        // Se não houver dados válidos para atualizar no DTO
        if (Object.keys(dataRepo).length === 0) {
            console.log(`[Service LoteProd] Nenhum dado fornecido para atualizar lote ${lote_id}.`);
            return loteExistente; // Retorna o lote existente sem alterações
        }

        try {
            const atualizado = await this.loteProdRepository.atualizar(lote_id, dataRepo);
            if (!atualizado) throw new AppError(`Lote ID ${lote_id} não encontrado ou falha ao atualizar.`, 404);
            return atualizado;
        } catch (error) {
             if (error instanceof AppError) throw error;
             console.error(`[Service LoteProd] Erro ao atualizar lote ${lote_id}:`, error);
             throw new AppError("Erro interno ao atualizar lote.", 500, false);
        }
    }

    async excluirLote(lote_id: number): Promise<void> {
        await this.buscarLotePorId(lote_id, true); // Garante que existe e está ativo antes de desativar
        try {
            const excluido = await this.loteProdRepository.excluir(lote_id);
            if (!excluido) throw new AppError(`Lote ID ${lote_id} não encontrado ou já inativo.`, 404);
        } catch (error) {
             // <<< CORREÇÃO >>>
             if (error instanceof AppError) throw error;
             console.error(`[Service LoteProd] Erro ao excluir lote ${lote_id}:`, error);
             throw new AppError("Erro interno ao excluir lote.", 500, false);
             // -------------
        }
    }

    async listarDisponiveisParaPromocao(queryDto: ListarLotesDisponiveisQueryDto): Promise<LoteProd[]> {
        const filtrosRepo: ListarLotesDisponiveisFiltros = {
            produtoId: queryDto.produtoId,
            fornecedorId: queryDto.fornecedorId, // Backend repo deve saber como usar isso (ex: JOIN com PRODUTO que tem FK de fornecedor)
            apenasComEstoque: queryDto.apenasComEstoque === undefined ? true : queryDto.apenasComEstoque === 'true',
            apenasNaoVencidos: queryDto.apenasNaoVencidos === undefined ? true : queryDto.apenasNaoVencidos === 'true',
        };
        try {
            console.log("[Service LoteProd] Listando lotes disponíveis (promo) com filtros:", filtrosRepo);
            const lotes = await this.loteProdRepository.listarDisponiveis(filtrosRepo);
            console.log(`[Service LoteProd] ${lotes.length} lotes disponíveis (promo) encontrados.`);
            return lotes;
        } catch (error) {
            // <<< CORREÇÃO >>>
            if (error instanceof AppError) throw error;
            console.error("[Service LoteProd] Erro ao listar lotes disponíveis (promo):", error);
            throw new AppError("Erro interno ao listar lotes para seleção.", 500, false);
            // -------------
        }
    }
}