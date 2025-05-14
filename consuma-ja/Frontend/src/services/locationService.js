import axios from 'axios'; // Importa o axios diretamente

// !!!!! SUBSTITUA 'SEU_IP_LOCAL_AQUI' PELO SEU IP LOCAL REAL !!!!!
// !!!!! CONFIRME SE A PORTA 3001 ESTÁ CORRETA PARA ESTE SERVIÇO !!!!!
<<<<<<< HEAD
const API_URL_BASE = 'http://172.20.0.13:3001/api/location';
=======
const API_URL_BASE = 'http://172.16.241.5:3001/api/location';
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)

// --- Funções do Serviço ---

// == ESTADOS ==
const getEstados = (params) => {
  return axios.get(`${API_URL_BASE}/estados`, { params });
};

const getEstadoById = (id) => {
  return axios.get(`${API_URL_BASE}/estados/${id}`);
};

const createEstado = (data) => {
  return axios.post(`${API_URL_BASE}/estados`, data);
};

const updateEstado = (id, data) => {
  return axios.put(`${API_URL_BASE}/estados/${id}`, data);
};

const deleteEstado = (id) => {
  return axios.delete(`${API_URL_BASE}/estados/${id}`);
};

// == CIDADES ==
const getCidades = (params) => {
  return axios.get(`${API_URL_BASE}/cidades`, { params });
};

const getCidadeById = (id) => {
  return axios.get(`${API_URL_BASE}/cidades/${id}`);
};

const getCidadesByEstado = (estadoId) => {
  return axios.get(`${API_URL_BASE}/estados/${estadoId}/cidades`);
};

const createCidade = (data) => {
  return axios.post(`${API_URL_BASE}/cidades`, data);
};

const updateCidade = (id, data) => {
  return axios.put(`${API_URL_BASE}/cidades/${id}`, data);
};

const deleteCidade = (id) => {
  return axios.delete(`${API_URL_BASE}/cidades/${id}`);
};

// == CEP ==
const lookupCep = (cep) => {
   const cleanedCep = String(cep).replace(/\D/g, '');
   if (cleanedCep.length !== 8) {
       return Promise.reject(new Error("Formato de CEP inválido. Use 8 dígitos."));
   }
   return axios.get(`${API_URL_BASE}/cep/${cleanedCep}`);
};

// Exportar um objeto com todas as funções
const locationService = {
    getEstados,
    getEstadoById,
    createEstado,
    updateEstado,
    deleteEstado,
    getCidades,
    getCidadeById,
    getCidadesByEstado,
    createCidade,
    updateCidade,
    deleteCidade,
    lookupCep,
};

export default locationService;