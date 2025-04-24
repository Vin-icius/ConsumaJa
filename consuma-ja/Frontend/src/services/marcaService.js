import axios from 'axios';

const API_URL_BASE = 'http://172.20.0.13:3000/api/product';

// Funções auxiliares para tratamento de erro (pode mover para um utils)
const handleRequest = async (requestPromise) => {
  try {
    const response = await requestPromise;
    return response.data; // Retorna apenas os dados
  } catch (error) {
    console.error('Erro na chamada API (Marca):', error.response?.data || error.message || error);
    throw error; // Relança para o componente tratar
  }
};
const handleRequestNoData = async (requestPromise) => {
    try {
        await requestPromise;
    } catch (error) {
        console.error('Erro na chamada API (Marca):', error.response?.data || error.message || error);
        throw error;
    }
};


// Assume endpoints REST padrão: /marcas, /marcas/:id
// O backend para Marca deve ter rotas equivalentes a estas

const criarMarca = (marcaData) => {
    // Ex: marcaData = { marca_nome: 'Nova Marca' }
    return handleRequest(axios.post(`${API_URL_BASE}/marcas`, marcaData));
};

const listarMarcas = async () => {
     try {
        // Não precisa passar a API_URL completa, só o path relativo à base
        const response = await axios.get(`${API_URL_BASE}/marcas`);
        // Garante retorno de array
        return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
         console.error('Erro ao listar marcas:', error.response?.data || error.message || error);
         return []; // Retorna array vazio em caso de erro para Pickers
    }
};

const getMarcaById = (id) => {
    return handleRequest(axios.get(`${API_URL_BASE}/marcas/${id}`));
};

// Recebe ID e dados para atualizar
const atualizarMarca = (id, marcaData) => {
     // Ex: marcaData = { marca_nome: 'Marca Editada' }
    // Corrigindo a template string e usando o ID correto
    return handleRequest(axios.put(`${API_URL_BASE}/marcas/${id}`, marcaData));
};

const excluirMarca = (id) => {
    // Corrigindo a template string
    return handleRequestNoData(axios.delete(`${API_URL_BASE}/marcas/${id}`));
};

// Exporta as funções corrigidas e adiciona getMarcaById
const marcaService = {
  criarMarca,
  listarMarcas,
  getMarcaById, // Adicionado
  atualizarMarca,
  excluirMarca,
};

export default marcaService;