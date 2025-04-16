import axios from 'axios';

const API_URL = 'http://localhost:3000/produtos'; // Ajuste a URL do seu backend

const produtoService = {
  criarProduto: async (produto) => {
    try {
      const response = await axios.post(API_URL, produto);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  listarProdutos: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw error;
    }
  },

  atualizarProduto: async (produto) => {
    try {
      const response = await axios.put(`${API_URL}/prod/${produto.id}`, produto);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  excluirProduto: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
  },

  listarProdutosPendentes: async () => {
    try {
      const response = await axios.get(`${API_URL}/pend/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar produtos pendentes:', error);
      throw error;
    }
  },

  aprovarProduto: async (produtoId) => {
    try {
      await axios.put(`${API_URL}/prod/${produtoId}/aprovar`);
    } catch (error) {
      console.error('Erro ao aprovar produto:', error);
      throw error;
    }
  },

  rejeitarProduto: async (produtoId, motivoRejeicao) => {
    try {
      await axios.put(`${API_URL}/prod/${produtoId}/rejeitar`, { motivoRejeicao });
    } catch (error) {
      console.error('Erro ao rejeitar produto:', error);
      throw error;
    }
  },
};

export default produtoService;