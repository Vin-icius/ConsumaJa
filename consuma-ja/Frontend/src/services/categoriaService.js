import { productApiClient } from '../api/client'

const handleRequest = async (requestPromise) => {
  try { return (await requestPromise).data }
  catch (error) {
    console.error('[CategoriaService]', error.response?.data || error.message || error)
    throw error
  }
}
const handleRequestNoData = async (requestPromise) => {
  try { await requestPromise }
  catch (error) {
    console.error('[CategoriaService]', error.response?.data || error.message || error)
    throw error
  }
}

const categoriaService = {
  criarCategoria: (data) => handleRequest(productApiClient.post('/categorias', data)),
  listarCategorias: () => handleRequest(productApiClient.get('/categorias')),
  getCategoriaById: (id) => handleRequest(productApiClient.get(`/categorias/${id}`)),
  atualizarCategoria: (id, data) => handleRequest(productApiClient.put(`/categorias/${id}`, data)),
  excluirCategoria: (id) => handleRequestNoData(productApiClient.delete(`/categorias/${id}`)),
}

export default categoriaService
