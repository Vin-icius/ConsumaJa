import axios from 'axios';

const API_URL = 'http://localhost:3000/tipos'; // Ajuste a URL do seu backend

const criarTipo = async (tipo) => {
  try {
    const response = await axios.post(API_URL, tipo);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar tipo:', error);
    throw error;
  }
};

const listarTipos = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar tipos:', error);
    throw error;
  }
};

const atualizarTipo = async (tipo) => {
  try {
    const response = await axios.put(`<span class="math-inline">\{API\_URL\}/</span>{tipo.id}`, tipo);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar tipo:', error);
    throw error;
  }
};

const excluirTipo = async (id) => {
  try {
    await axios.delete(`<span class="math-inline">\{API\_URL\}/</span>{id}`);
  } catch (error) {
    console.error('Erro ao excluir tipo:', error);
    throw error;
  }
};

export default {
  criarTipo,
  listarTipos,
  atualizarTipo,
  excluirTipo,
};