import { locationApiClient } from '../api/client'

const handleRequest = async (requestPromise) => {
  try { return (await requestPromise).data }
  catch (error) {
    console.error('[LocationService]', error.response?.data || error.message || error)
    throw error
  }
}
const handleRequestNoData = async (requestPromise) => {
  try { await requestPromise }
  catch (error) {
    console.error('[LocationService]', error.response?.data || error.message || error)
    throw error
  }
}

const locationService = {
  getEstados: (params) => handleRequest(locationApiClient.get('/estados', { params })),
  getEstadoById: (id) => handleRequest(locationApiClient.get(`/estados/${id}`)),
  createEstado: (data) => handleRequest(locationApiClient.post('/estados', data)),
  updateEstado: (id, data) => handleRequest(locationApiClient.put(`/estados/${id}`, data)),
  deleteEstado: (id) => handleRequestNoData(locationApiClient.delete(`/estados/${id}`)),

  getCidades: (params) => handleRequest(locationApiClient.get('/cidades', { params })),
  getCidadeById: (id) => handleRequest(locationApiClient.get(`/cidades/${id}`)),
  getCidadesByEstado: (estadoId) => handleRequest(locationApiClient.get(`/estados/${estadoId}/cidades`)),
  createCidade: (data) => handleRequest(locationApiClient.post('/cidades', data)),
  updateCidade: (id, data) => handleRequest(locationApiClient.put(`/cidades/${id}`, data)),
  deleteCidade: (id) => handleRequestNoData(locationApiClient.delete(`/cidades/${id}`)),

  lookupCep: (cep) => {
    const cleanedCep = String(cep).replace(/\D/g, '')
    if (cleanedCep.length !== 8) {
      return Promise.reject(new Error("CEP inválido. Use 8 dígitos."))
    }
    return handleRequest(locationApiClient.get(`/cep/${cleanedCep}`))
  }
}

export default locationService
