import { Avaliacao } from "../entities/avaliacao.entity";

// Dados para criar o conjunto de avaliação e respostas
export interface CreateAvaliacaoRepoData {
    VENDA_venda_id: number;
    PESSOA_pessoa_id: number;
    respostas: { pergunta_id: number, nota: number }[];
}

export interface AvaliacaoRepository {
  // O método criar agora aceita o payload do questionário
  criar(data: CreateAvaliacaoRepoData): Promise<Avaliacao>;
  
  // Poderíamos adicionar outros métodos como buscarPorVendaId, etc. no futuro
}