import axios from 'axios';

const API_URL = 'http://localhost:3000/marcas'; // Ajuste a URL do seu backend

const criarMarca = async (marca) => {
  try {
    const response = await axios.post(API_URL, marca);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar marca:', error);
    throw error;
  }
};

const listarMarcas = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar marcas:', error);
    throw error;
  }
};

const atualizarMarca = async (marca) => {
  try {
    const response = await axios.put(`<span class="math-inline">\{API\_URL\}/</span>{marca.id}`, marca);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar marca:', error);
    throw error;
  }
};

const excluirMarca = async (id) => {
  try {
    await axios.delete(`<span class="math-inline">\{API\_URL\}/</span>{id}`);
  } catch (error) {
    console.error('Erro ao excluir marca:', error);
    throw error;
  }
};

export default {
  criarMarca,
  listarMarcas,
  atualizarMarca,
  excluirMarca,
};