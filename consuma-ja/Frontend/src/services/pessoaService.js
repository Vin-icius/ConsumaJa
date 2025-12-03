import { pessoaApiClient } from '../api/client'

const handleRequest = async (requestPromise) => {
  try { return (await requestPromise).data }
  catch (error) {
    console.error('[PessoaService]', error.response?.data || error.message || error)
    throw error
  }
}
const handleRequestNoData = async (requestPromise) => {
  try { await requestPromise }
  catch (error) {
    console.error('[PessoaService]', error.response?.data || error.message || error)
    throw error
  }
}

const pessoaService = {
  registrar: (data) => handleRequest(pessoaApiClient.post('/pessoa/registrar', data)),
  listarPessoas: (params) => handleRequest(pessoaApiClient.get('/pessoa', { params })),
  buscarPessoaPorId: (id) => handleRequest(pessoaApiClient.get(`/pessoa/${id}`)),
  atualizarPessoa: (id, data) => handleRequest(pessoaApiClient.put(`/pessoa/${id}`, data)),
  excluirPessoa: (id) => handleRequestNoData(pessoaApiClient.delete(`/pessoa/${id}`)),

  buscarConfiguracaoPagamentoFornecedor: (fornecedorId) =>
    handleRequest(pessoaApiClient.get(`/fornecedores/${fornecedorId}/config-pagamento`)),

  atualizarConfiguracaoPagamentoFornecedor: (fornecedorId, payload) =>
    handleRequest(
      pessoaApiClient.put(`/fornecedores/${fornecedorId}/config-pagamento`, payload),
    ),

  uploadFoto: (id, tipo, formData) =>
    handleRequest(pessoaApiClient.post(`/pessoa/${id}/upload/${tipo}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })),
}

export default pessoaService
