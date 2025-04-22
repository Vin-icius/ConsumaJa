import axios from 'axios';

const API_URL_BASE = 'http://172.16.241.5:3000/api/product'; // <<< CORRIGIDO: Termina antes do recurso específico

// Funções auxiliares para tratamento de erro
const handleRequest = async (requestPromise) => {
  try {
    const response = await requestPromise;
    return response.data;
  } catch (error) {
    // Log detalhado do erro para ajudar no debug
    console.error(`Erro na chamada API (Produto) para ${error.config?.url}:`, error.response?.data || error.message || error);
    throw error; // Relança para o componente/tela tratar
  }
};
const handleRequestNoData = async (requestPromise) => {
    try {
        await requestPromise;
    } catch (error) {
        console.error(`Erro na chamada API (Produto) para ${error.config?.url}:`, error.response?.data || error.message || error);
        throw error;
    }
};

// src/services/produtoService.js - Trechos Atualizados
// ... API_URL_BASE e helpers ...

const produtoService = {
  // ... criar, listar, getById, atualizar, excluir (usando /produtos e /produtos/:id) ...
  criarProduto: (produto) => handleRequest(axios.post(`${API_URL_BASE}/produtos`, produto)),
  listarProdutos: (params = {}) => handleRequest(axios.get(`${API_URL_BASE}/produtos`, { params })),
  getProdutoById: (id) => handleRequest(axios.get(`${API_URL_BASE}/produtos/${id}`)),
  atualizarProduto: (produtoId, data) => handleRequest(axios.put(`${API_URL_BASE}/produtos/${produtoId}`, data)),
  excluirProduto: (id) => handleRequestNoData(axios.delete(`${API_URL_BASE}/produtos/${id}`)),

  // <<< Paths Corrigidos >>>
  listarProdutosPendentes: () => handleRequest(axios.get(`${API_URL_BASE}/produtos/pendentes`)),
  aprovarProduto: (produtoId) => handleRequestNoData(axios.patch(`${API_URL_BASE}/produtos/${produtoId}/aprovar`)), // Usando PATCH
  rejeitarProduto: (produtoId, motivoRejeicao) => handleRequestNoData(axios.patch(`${API_URL_BASE}/produtos/${produtoId}/rejeitar`, { motivo: motivoRejeicao })), // Usando PATCH e nome correto do campo

};

export default produtoService;