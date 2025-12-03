import { orderApiClient } from '../api/client'

export type ComplaintStatus = 'PENDENTE' | 'ANALISE' | 'APROVADA' | 'REJEITADA'

export interface ComplaintReportFilters {
  page?: number
  limit?: number
  search?: string
  status?: ComplaintStatus | ''
  startDate?: string
  endDate?: string
  fornecedorId?: number
  clienteId?: number
  fornecedorNome?: string
  clienteNome?: string
}

export interface ComplaintReportItem {
  id: number
  vendaId: number
  status: ComplaintStatus
  motivo: string
  criadoEm: string
  valorTotal: number
  cliente: {
    id: number
    nome: string
    email: string
  }
  fornecedor: {
    id: number | null
    nome: string | null
  } | null
  promocao: {
    id: number | null
    descricao: string | null
  } | null
  itens: Array<{
    loteId: number
    quantidade: number
    produtoNome: string | null
  }>
}

export interface ComplaintReportStats {
  pendente: number
  analise: number
  aprovada: number
  rejeitada: number
}

export interface ComplaintReportResponse {
  data: ComplaintReportItem[]
  page: number
  limit: number
  total: number
  totalPages: number
  stats: ComplaintReportStats
}

const handleRequest = async <T>(requestPromise: Promise<any>): Promise<T> => {
  try {
    const response = await requestPromise
    return response.data as T
  } catch (error: any) {
    const errConfig = error?.config || {}
    const target = `${errConfig.method?.toUpperCase() || ''} ${errConfig.baseURL || ''}${errConfig.url || ''}`
    console.error(`[ComplaintService] Erro ao chamar ${target}`, error?.response?.data || error?.message || error)
    throw error
  }
}

const listComplaintReports = (params: ComplaintReportFilters): Promise<ComplaintReportResponse> =>
  handleRequest(orderApiClient.get('/orders/complaints/report', { params }))

const complaintService = {
  listComplaintReports,
}

export default complaintService
