import { AxiosResponse } from 'axios';
import { productApiClient } from '../api/client';

// --- INTERFACES DE TIPO ---
export interface CriarAvaliacaoPayload {
  venda_id: number;
  pessoa_id: number;
  respostas: {
    pergunta_id: number;
    nota: number;
  }[];
}

export interface UpdateAvaliacaoPayload {
  respostas: {
    pergunta_id: number;
    nota: number;
  }[];
}

export interface AvaliacaoResponse {
  avaliacao_id: number;
  VENDA_venda_id: number;
  PESSOA_pessoa_id: number;
  avaliacao_data: string;
  notas?: { perguntas_id: number; avaliacao_nota: number }[];
}

export interface FiltrosRelatorio {
    clienteId?: number;
    nota?: number;
    dataInicio?: string;
    dataFim?: string;
    promocaoId?: number;
    page?: number;
    limit?: number;
}

// --- LÓGICA DO SERVIÇO ---
const handleRequest = async <T>(requestPromise: Promise<AxiosResponse<T>>): Promise<T> => {
  try { return (await requestPromise).data; }
  catch (error: any) {
    console.error('[AvaliacaoService]', error.response?.data || error.message || error);
    throw error;
  }
};

const avaliacaoService = {
  enviarRespostas: (data: CriarAvaliacaoPayload): Promise<any> => 
    handleRequest(productApiClient.post('/avaliacoes', data)),

  buscarPorVendaId: (vendaId: number): Promise<AvaliacaoResponse | null> => 
    handleRequest(productApiClient.get(`/avaliacoes/venda/${vendaId}`)),

  atualizar: (avaliacaoId: number, data: UpdateAvaliacaoPayload): Promise<AvaliacaoResponse> => 
    handleRequest(productApiClient.put(`/avaliacoes/${avaliacaoId}`, data)),

  excluir: (avaliacaoId: number): Promise<void> => 
    handleRequest(productApiClient.delete(`/avaliacoes/${avaliacaoId}`)),

  gerarRelatorio: (filtros: FiltrosRelatorio) =>
    handleRequest(productApiClient.get('/avaliacoes/relatorio', { params: filtros })),
};

export default avaliacaoService;