import { Avaliacao } from "../entities/avaliacao.entity";

export interface PaginatedRepositoryResponse<T> {
  data: T[];
  total: number;
}

export interface AvaliacaoStats {
    media: number;
    total: number;
}

// Dados que o repositório espera para CRIAR uma avaliação
export type CreateAvaliacaoRepoData = Omit<Avaliacao, 'avaliacao_id' | 'data_criacao' | 'data_atualizacao'>;

// Dados que o repositório espera para ATUALIZAR uma avaliação
export type UpdateAvaliacaoRepoData = Partial<Pick<Avaliacao, 'nota' | 'comentario'>>;

export interface AvaliacaoRepository {
  criar(data: CreateAvaliacaoRepoData): Promise<Avaliacao>;
  atualizar(avaliacao_id: number, pessoa_id: number, data: UpdateAvaliacaoRepoData): Promise<Avaliacao | null>;
  excluir(avaliacao_id: number, pessoa_id: number): Promise<boolean>;
  buscarPorId(avaliacao_id: number): Promise<Avaliacao | null>;

  // Busca uma avaliação específica de um usuário para um produto
  buscarPorPessoaEProduto(pessoa_id: number, produto_id: number): Promise<Avaliacao | null>;

  // Lista todas as avaliações de um produto com paginação
  listarPorProdutoId(produto_id: number, page: number, limit: number): Promise<PaginatedRepositoryResponse<Avaliacao>>;

  // Calcula a nota média e o total de avaliações para um produto
  calcularEstatisticasPorProduto(produto_id: number): Promise<AvaliacaoStats>;
}