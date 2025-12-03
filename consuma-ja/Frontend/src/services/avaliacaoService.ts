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
  descricao?: string;
  pessoa_id?: number;
}
export interface AvaliacaoResponse {
  avaliacao_id: number;
  VENDA_venda_id: number;
  PESSOA_pessoa_id: number;
  avaliacao_data: string;
}

export interface AvaliacaoReportFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  notaMin?: number;
  notaMax?: number;
  fornecedorId?: number;
  clienteId?: number;
  fornecedorNome?: string;
  clienteNome?: string;
  search?: string;
}

export interface AvaliacaoReportItem {
  avaliacao_id: number;
  venda_id: number;
  avaliacao_data: string;
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

export interface AvaliacaoReportResponse {
  data: AvaliacaoReportItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

  listarAvaliacoes: (params: AvaliacaoReportFilters): Promise<AvaliacaoReportResponse> => 
    handleRequest(productApiClient.get<AvaliacaoReportResponse>('/avaliacoes', { params })),
};

export default avaliacaoService;