import { AxiosResponse } from 'axios';
import { orderApiClient } from '../api/client'; // Usa o cliente correto (Order)

// --- INTERFACES DE TIPO ---
export interface CriarReclamacaoPayload {
  titulo: string;
  descricao: string;
  classificacao: number;
  venda_id: number;
  pessoa_id: number;
}

export interface AvaliarReclamacaoPayload {
  aprovado: boolean;
  resposta: string;
}

export interface ReclamacaoResponse {
  reclamacao_id: number;
  titulo: string;
  descricao: string;
  classificacao: number;
  status: 'PENDENTE' | 'ANALISE' | 'RESOLVIDA' | 'REJEITADA';
  data_abertura: string;
  data_fechamento?: string;
  resposta_admin?: string;
  pessoa_nome?: string; // Se o backend fizer join
  VENDA_venda_id: number;
  PESSOA_pessoa_id: number;
}

// --- LÓGICA DO SERVIÇO (Helper para tratamento de erro padrão) ---
const handleRequest = async <T>(requestPromise: Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    return (await requestPromise).data;
  } catch (error: any) {
    console.error('[ReclamacaoService]', error.response?.data || error.message || error);
    throw error;
  }
};

const reclamacaoService = {
  // POST: Criar nova reclamação
  criarReclamacao: (data: CriarReclamacaoPayload): Promise<ReclamacaoResponse> => 
    handleRequest(orderApiClient.post<ReclamacaoResponse>('/reclamacoes', data)),

  // GET: Listar todas (Admin)
  listarReclamacoes: (): Promise<ReclamacaoResponse[]> => 
    handleRequest(orderApiClient.get<ReclamacaoResponse[]>('/reclamacoes')),

  // PATCH: Avaliar (Aprovar/Rejeitar)
  avaliarReclamacao: (id: number, data: AvaliarReclamacaoPayload): Promise<ReclamacaoResponse> => 
    handleRequest(orderApiClient.patch<ReclamacaoResponse>(`/reclamacoes/${id}/avaliacao`, data)),
};

export default reclamacaoService;