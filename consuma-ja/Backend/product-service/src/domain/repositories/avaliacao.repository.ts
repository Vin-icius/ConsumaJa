import { Avaliacao } from "../entities/avaliacao.entity";

// Dados para criar o conjunto de avaliação e respostas
export interface CreateAvaliacaoRepoData {
    VENDA_venda_id: number;
    PESSOA_pessoa_id: number;
    respostas: { pergunta_id: number, nota: number }[];
  descricao?: string | null;
}

export interface AvaliacaoResumoItem {
  avaliacao_id: number;
  venda_id: number;
  avaliacao_data: Date;
  avaliacao_descricao: string | null;
  nota_media: number | null;
  total_notas: number;
  cliente: {
    id: number;
    nome: string;
    email: string;
  };
  fornecedor: {
    id: number | null;
    nome: string | null;
  } | null;
  promocao?: {
    id: number | null;
    descricao: string | null;
  } | null;
  produtos: Array<{ nome: string; quantidade: number }>;
}

export interface ListarAvaliacoesFilters {
  page: number;
  limit: number;
  fornecedorId?: number;
  clienteId?: number;
  fornecedorNome?: string;
  clienteNome?: string;
  notaMin?: number;
  notaMax?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  isAdmin: boolean;
}

export interface ListarAvaliacoesResult {
  data: AvaliacaoResumoItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AvaliacaoRepository {
  // O método criar agora aceita o payload do questionário
  criar(data: CreateAvaliacaoRepoData): Promise<Avaliacao>;

  listar(filters: ListarAvaliacoesFilters): Promise<ListarAvaliacoesResult>;
  
  // Poderíamos adicionar outros métodos como buscarPorVendaId, etc. no futuro
}