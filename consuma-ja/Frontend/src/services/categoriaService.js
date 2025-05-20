import axios from 'axios';
import { productApiClient } from '../api/client';

const API_URL_BASE = PRODUCT_API_URL;

// Funções auxiliares (pode importar de um utils)
const handleRequest = async (requestPromise) => {
  try { const response = await requestPromise; return response.data; }
  catch (error) { console.error('Erro na chamada API (Categoria):', error.response?.data || error.message || error); throw error; }
};
const handleRequestNoData = async (requestPromise) => {
    try { await requestPromise; }
    catch (error) { console.error('Erro na chamada API (Categoria):', error.response?.data || error.message || error); throw error; }
};


const criarCategoria = (categoriaData) => handleRequest(axios.post(`${API_URL_BASE}/categorias`, categoriaData));

const listarCategorias = async () => { // Manter async/await aqui para garantir retorno de array
    try {
        const response = await axios.get(`${API_URL_BASE}/categorias`);
        // Garante que sempre retorna um array, mesmo se a API falhar ou retornar algo inesperado
        return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
         console.error('Erro ao listar categorias:', error.response?.data || error.message || error);
         return []; // Retorna array vazio em caso de erro para não quebrar Pickers
         // throw error; // Ou relance se preferir tratar no componente
    }
};

const getCategoriaById = (id) => handleRequest(axios.get(`${API_URL_BASE}/categorias/${id}`));

const atualizarCategoria = (id, categoriaData) => handleRequest(axios.put(`${API_URL_BASE}/categorias/${id}`, categoriaData));

const excluirCategoria = (id) => handleRequestNoData(axios.delete(`${API_URL_BASE}/categorias/${id}`));

const categoriaService = {
  criarCategoria,
  listarCategorias,
  getCategoriaById,
  atualizarCategoria,
  excluirCategoria,
};

export default categoriaService;