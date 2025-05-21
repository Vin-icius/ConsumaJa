import { productApiClient } from '../api/client'

const handleRequest = async (requestPromise) => {
  try { return (await requestPromise).data }
  catch (error) {
    console.error('[TipoService]', error.response?.data || error.message || error)
    throw error
  }
}
const handleRequestNoData = async (requestPromise) => {
  try { await requestPromise }
  catch (error) {
    console.error('[TipoService]', error.response?.data || error.message || error)
    throw error
  }
}

const tipoService = {
  criarTipo: (data) => handleRequest(productApiClient.post('/tipos', data)),
  listarTipos: () => handleRequest(productApiClient.get('/tipos')),
  getTipoById: (id) => handleRequest(productApiClient.get(`/tipos/${id}`)),
  atualizarTipo: (id, data) => handleRequest(productApiClient.put(`/tipos/${id}`, data)),
  excluirTipo: (id) => handleRequestNoData(productApiClient.delete(`/tipos/${id}`)),
}

export default tipoService
