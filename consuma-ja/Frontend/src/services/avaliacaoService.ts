import { AxiosResponse } from 'axios';
import { productApiClient } from '../api/client'; 

// --- INTERFACES DE TIPO ---
export interface Pergunta {
  perguntas_id: number;
  perguntas_descricao: string;
  ativo: boolean;
}
export interface CriarAvaliacaoPayload {
  venda_id: number;
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
}

// --- LÓGICA DO SERVIÇO ---
const handleRequest = async <T>(requestPromise: Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    return (await requestPromise).data;
  } catch (error: any) {
    console.error('[AvaliacaoService]', error.response?.data || error.message || error);
    throw error;
  }
};

const avaliacaoService = {
  listarPerguntasAtivas: (): Promise<Pergunta[]> => 
    handleRequest(productApiClient.get<Pergunta[]>('/perguntas/ativas')),

  enviarRespostas: (data: CriarAvaliacaoPayload): Promise<AvaliacaoResponse> => 
    handleRequest(productApiClient.post<AvaliacaoResponse>('/avaliacoes', data)),
};

export default avaliacaoService;