import { AxiosResponse } from 'axios';
import { productApiClient } from '../api/client';

// --- INTERFACES DE TIPO ---
export interface Pergunta {
  perguntas_id: number;
  perguntas_descricao: string;
  ativo: boolean;
}

// --- LÓGICA DO SERVIÇO ---
const handleRequest = async <T>(requestPromise: Promise<AxiosResponse<T>>): Promise<T> => {
  try { return (await requestPromise).data; }
  catch (error: any) {
    console.error('[PerguntaService]', error.response?.data || error.message || error);
    throw error;
  }
};

const perguntaService = {
  // --- Funções do Cliente ---
  listarAtivas: (): Promise<Pergunta[]> =>
    handleRequest(productApiClient.get<Pergunta[]>('/perguntas/ativas')),

  // --- Funções de Gerenciamento (Admin) ---
  listarTodas: (): Promise<Pergunta[]> =>
    handleRequest(productApiClient.get<Pergunta[]>('/perguntas')),

  criar: (data: { perguntas_descricao: string, ativo: boolean }): Promise<Pergunta> =>
    handleRequest(productApiClient.post<Pergunta>('/perguntas', data)),
  
  atualizar: (id: number, data: { perguntas_descricao?: string, ativo?: boolean }): Promise<Pergunta> =>
    handleRequest(productApiClient.put<Pergunta>(`/perguntas/${id}`, data)),

  excluir: (id: number): Promise<void> =>
    handleRequest(productApiClient.delete<void>(`/perguntas/${id}`)),
};

export default perguntaService;