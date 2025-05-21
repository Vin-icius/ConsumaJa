import { productApiClient } from '../api/client'

const handleRequest = async (requestPromise) => {
  try { return (await requestPromise).data }
  catch (error) {
    console.error('[MarcaService]', error.response?.data || error.message || error)
    throw error
  }
}
const handleRequestNoData = async (requestPromise) => {
  try { await requestPromise }
  catch (error) {
    console.error('[MarcaService]', error.response?.data || error.message || error)
    throw error
  }
}

const marcaService = {
  criarMarca: (data) => handleRequest(productApiClient.post('/marcas', data)),
  listarMarcas: () => handleRequest(productApiClient.get('/marcas')),
  getMarcaById: (id) => handleRequest(productApiClient.get(`/marcas/${id}`)),
  atualizarMarca: (id, data) => handleRequest(productApiClient.put(`/marcas/${id}`, data)),
  excluirMarca: (id) => handleRequestNoData(productApiClient.delete(`/marcas/${id}`)),
}

export default marcaService
