import { orderApiClient, pessoaApiClient } from '../api/client'

const ORDERS_PREFIX = '/orders'

const handleRequest = async (requestPromise: Promise<any>) => {
  try {
    const response = await requestPromise
    return response.data
  } catch (error: any) {
    const errConfig = error?.config || {}
    const target = `${errConfig.method?.toUpperCase() || ''} ${errConfig.baseURL || ''}${errConfig.url || ''}`
    console.error(`[OrderService] Erro ao chamar ${target}`, error?.response?.data || error?.message || error)
    throw error
  }
}

const finalizeSale = (payload: any) => handleRequest(orderApiClient.post('/promocoes/sale', payload))

const getSupplierSales = (pessoaId: number, params: Record<string, any> = {}) =>
  handleRequest(orderApiClient.get(`${ORDERS_PREFIX}/suppliers/${pessoaId}/sales`, { params }))

const getClientSales = (pessoaId: number, params: Record<string, any> = {}) =>
  handleRequest(orderApiClient.get(`${ORDERS_PREFIX}/clients/${pessoaId}/sales`, { params }))

const getSaleById = (vendaId: number) => handleRequest(orderApiClient.get(`${ORDERS_PREFIX}/sales/${vendaId}`))

const advanceSaleStage = (vendaId: number, body: Record<string, any>) =>
  handleRequest(orderApiClient.put(`${ORDERS_PREFIX}/sales/${vendaId}/stage`, body))

const createComplaint = (
  vendaId: number,
  payload: {
    motivo: string
    itens: { loteId: number; quantidade: number }[]
    actorId?: number | null
    actorTipo?: string | null
    pessoaId?: number | null
  },
) => handleRequest(orderApiClient.post(`${ORDERS_PREFIX}/sales/${vendaId}/complaints`, payload))

const updateComplaintStatus = (
  complaintId: number,
  payload: {
    status: string
    actorId?: number | null
    actorTipo?: string | null
    pessoaId?: number | null
    fornecedorId?: number | null
  },
) => handleRequest(orderApiClient.patch(`${ORDERS_PREFIX}/complaints/${complaintId}/status`, payload))

const normalizeNotificationResponse = (payload: any) => {
  if (Array.isArray(payload)) {
    return payload
  }
  if (payload && Array.isArray(payload.data)) {
    return payload.data
  }
  return []
}

const listNotifications = async (pessoaId: number, params: Record<string, any> = {}) => {
  const response = await handleRequest(pessoaApiClient.get(`/notifications/${pessoaId}`, { params }))
  return normalizeNotificationResponse(response)
}

const markNotificationAsRead = (notificationId: number) =>
  handleRequest(pessoaApiClient.patch(`/notifications/${notificationId}/read`))

const orderService = {
  finalizeSale,
  getSupplierSales,
  getClientSales,
  getSaleById,
  advanceSaleStage,
  createComplaint,
  updateComplaintStatus,
  listNotifications,
  markNotificationAsRead,
}

export default orderService
