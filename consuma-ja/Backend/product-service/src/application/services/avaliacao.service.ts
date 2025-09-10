import { AppError } from "../../common/errors/app-error";
import { Avaliacao } from "../../domain/entities/avaliacao.entity";
import { AvaliacaoRepository, AvaliacaoStats } from "../../domain/repositories/avaliacao.repository";
import { ProdutoRepository } from "../../domain/repositories/produto.repository";
import { CreateAvaliacaoDto } from "../../interfaces/dtos/create-avaliacao.dto";
import { ListarAvaliacoesQueryDto } from "../../interfaces/dtos/listar-avaliacoes-query.dto";
import { UpdateAvaliacaoDto } from "../../interfaces/dtos/update-avaliacao.dto";

// Em um ambiente real de microserviços, você teria uma interface de repositório
// para se comunicar com o serviço de Pedidos.
export interface PedidoRepository {
    verificarCompra(pessoa_id: number, produto_id: number): Promise<{ comprou: boolean; pedido_id: number | null }>;
}

export interface PaginatedAvaliacaoResponse {
    data: Avaliacao[];
    stats: AvaliacaoStats;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}


export class AvaliacaoService {
    constructor(
        private avaliacaoRepository: AvaliacaoRepository,
        private produtoRepository: ProdutoRepository,
        // private pedidoRepository: PedidoRepository // Injetado para validar a compra
    ) {}

    async criar(dto: CreateAvaliacaoDto, pessoa_id: number): Promise<Avaliacao> {
        // 1. Validar se o produto existe e está ativo
        const produto = await this.produtoRepository.buscarPorId(dto.produto_id, true);
        if (!produto) {
            throw new AppError(`Produto com ID ${dto.produto_id} não encontrado ou inativo.`, 404);
        }

        // 2. Validar se o cliente realmente comprou o produto (REQUISITO CRÍTICO)
        // Esta parte dependeria de uma comunicação com o serviço de Pedidos.
        // Simulando a chamada:
        // const { comprou, pedido_id } = await this.pedidoRepository.verificarCompra(pessoa_id, dto.produto_id);
        // if (!comprou || !pedido_id) {
        //     throw new AppError("Você não pode avaliar um produto que não comprou.", 403);
        // }
        // Por agora, vamos assumir que o DTO inclui um `pedido_id` válido.
        // Uma validação real seria mais robusta.
        if (!dto.pedido_id) {
             throw new AppError("ID do Pedido é necessário para validar a avaliação.", 400);
        }


        // 3. Verificar se o usuário já avaliou este produto
        const avaliacaoExistente = await this.avaliacaoRepository.buscarPorPessoaEProduto(pessoa_id, dto.produto_id);
        if (avaliacaoExistente) {
            throw new AppError("Você já avaliou este produto.", 409);
        }

        // 4. Criar a avaliação
        const novaAvaliacao = await this.avaliacaoRepository.criar({
            ...dto,
            pessoa_id, // Adiciona o ID do usuário logado
            pedido_id: dto.pedido_id // Usando o pedido_id do DTO
        });

        return novaAvaliacao;
    }
    
    async atualizar(avaliacao_id: number, dto: UpdateAvaliacaoDto, pessoa_id: number): Promise<Avaliacao> {
        // O repositório já valida a posse (pessoa_id) na query, mas podemos verificar antes
        // para dar uma mensagem de erro mais clara.
        const avaliacaoExistente = await this.avaliacaoRepository.buscarPorId(avaliacao_id);
        if (!avaliacaoExistente) {
            throw new AppError(`Avaliação com ID ${avaliacao_id} não encontrada.`, 404);
        }
        if (avaliacaoExistente.pessoa_id !== pessoa_id) {
            throw new AppError("Você não tem permissão para editar esta avaliação.", 403);
        }

        const avaliacaoAtualizada = await this.avaliacaoRepository.atualizar(avaliacao_id, pessoa_id, dto);
        if (!avaliacaoAtualizada) {
            throw new AppError("Falha ao atualizar a avaliação.", 500); // Se chegou aqui, algo deu errado
        }
        return avaliacaoAtualizada;
    }

    async excluir(avaliacao_id: number, pessoa_id: number): Promise<void> {
        const excluido = await this.avaliacaoRepository.excluir(avaliacao_id, pessoa_id);
        if (!excluido) {
            // Pode ser que não encontrou ou não pertence ao usuário
            throw new AppError(`Avaliação com ID ${avaliacao_id} não encontrada ou você não tem permissão para excluí-la.`, 404);
        }
    }

    async listarPorProduto(produto_id: number, query: ListarAvaliacoesQueryDto): Promise<PaginatedAvaliacaoResponse> {
        const page = query.page || 1;
        const limit = query.limit || 10;

        const [paginatedResult, stats] = await Promise.all([
            this.avaliacaoRepository.listarPorProdutoId(produto_id, page, limit),
            this.avaliacaoRepository.calcularEstatisticasPorProduto(produto_id)
        ]);
        
        return {
            data: paginatedResult.data,
            stats,
            page,
            limit,
            total: paginatedResult.total,
            totalPages: Math.ceil(paginatedResult.total / limit)
        };
    }
}