import { Avaliacao } from "../entities/avaliacao.entity";
import { RelatorioAvaliacao } from '../entities/relatorio-avaliacao.entity';

// Dados para criar o conjunto de avaliação e respostas
export interface CreateAvaliacaoRepoData {
    VENDA_venda_id: number;
    PESSOA_pessoa_id: number;
    respostas: { pergunta_id: number, nota: number }[];
}

export interface FiltrosRelatorioAvaliacao {
    clienteId?: number;
    nota?: number;
    dataInicio?: Date;
    dataFim?: Date;
    promocaoId?: number;
    page?: number;
    limit?: number;
}

export interface PaginatedRelatorioResponse {
    data: RelatorioAvaliacao[];
    total: number;
}

export interface AvaliacaoRepository {
  // O método criar agora aceita o payload do questionário
  criar(data: CreateAvaliacaoRepoData): Promise<Avaliacao>;
  gerarRelatorio(filtros: FiltrosRelatorioAvaliacao): Promise<PaginatedRelatorioResponse>;
  
  // Poderíamos adicionar outros métodos como buscarPorVendaId, etc. no futuro
}