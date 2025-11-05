import { productApiClient } from '../api/client'

const handleRequest = async (requestPromise) => {
  try { return (await requestPromise).data }
  catch (error) {
    console.error('[ProdutoService]', error.response?.data || error.message || error)
    throw error
  }
}
const handleRequestNoData = async (requestPromise) => {
  try { await requestPromise }
  catch (error) {
    console.error('[ProdutoService]', error.response?.data || error.message || error)
    throw error
  }
}

const produtoService = {
  criarProduto: (data) => handleRequest(productApiClient.post('/produtos', data)),
  listarProdutos: (params) => handleRequest(productApiClient.get('/produtos', { params })),
  getProdutoById: (id) => handleRequest(productApiClient.get(`/produtos/${id}`)),
  atualizarProduto: (id, data) => handleRequest(productApiClient.put(`/produtos/${id}`, data)),
  excluirProduto: (id) => handleRequestNoData(productApiClient.delete(`/produtos/${id}`)),
  uploadProdutoImagem: (id, formData) => handleRequest(productApiClient.post(`/produtos/${id}/imagem`, formData)),

  listarProdutosPendentes: () => handleRequest(productApiClient.get('/produtos/pendentes')),
  aprovarProduto: (id) => handleRequestNoData(productApiClient.patch(`/produtos/${id}/aprovar`)),
  rejeitarProduto: (id, motivo) => handleRequestNoData(productApiClient.patch(`/produtos/${id}/rejeitar`, { motivo })),
}

export default produtoService
