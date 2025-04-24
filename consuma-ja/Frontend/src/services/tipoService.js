import axios from 'axios';

const API_URL_BASE = 'http://172.20.0.13:3000/api/product';

// Funções auxiliares para tratamento de erro (pode mover para um utils)
const handleRequest = async (requestPromise) => {
  try {
    const response = await requestPromise;
    return response.data; // Retorna apenas os dados
  } catch (error) {
    console.error('Erro na chamada API (Tipo):', error.response?.data || error.message || error);
    throw error; // Relança para o componente tratar
  }
};
const handleRequestNoData = async (requestPromise) => {
    try {
        await requestPromise;
    } catch (error) {
        console.error('Erro na chamada API (Tipo):', error.response?.data || error.message || error);
        throw error;
    }
};


// Assume endpoints REST padrão: /tipos, /tipos/:id
// O backend para Tipo deve ter rotas equivalentes a estas

const criarTipo = (tipoData) => {
    // Ex: tipoData = { tipo_nome: 'Novo Tipo' }
    return handleRequest(axios.post(`${API_URL_BASE}/tipos`, tipoData));
};

const listarTipos = async () => {
     try {
        const response = await axios.get(`${API_URL_BASE}/tipos`);
        // Garante retorno de array
        return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
         console.error('Erro ao listar tipos:', error.response?.data || error.message || error);
         return []; // Retorna array vazio em caso de erro para Pickers
    }
};

const getTipoById = (id) => {
    // Assume que existe um endpoint GET /tipos/:id no backend
    return handleRequest(axios.get(`${API_URL_BASE}/tipos/${id}`));
};

// Recebe ID e dados para atualizar
const atualizarTipo = (id, tipoData) => {
     // Ex: tipoData = { tipo_nome: 'Tipo Editado' }
    // Corrigindo a template string e usando o ID correto
    return handleRequest(axios.put(`${API_URL_BASE}/tipos/${id}`, tipoData));
};

const excluirTipo = (id) => {
    // Corrigindo a template string
    // Assumindo exclusão lógica ou física conforme definido no backend de Tipo
    return handleRequestNoData(axios.delete(`${API_URL_BASE}/tipos/${id}`));
};

// Exporta as funções corrigidas e adiciona getTipoById
const tipoService = {
  criarTipo,
  listarTipos,
  getTipoById, // Adicionado
  atualizarTipo,
  excluirTipo,
};

export default tipoService;