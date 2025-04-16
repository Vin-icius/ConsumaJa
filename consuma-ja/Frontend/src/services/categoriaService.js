import axios from 'axios';

const API_URL = 'http://localhost:3000/categorias'; // Ajuste a URL do seu backend

const criarCategoria = async (categoria) => {
  try {
    const response = await axios.post(API_URL, categoria);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};

const listarCategorias = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    throw error;
  }
};

const atualizarCategoria = async (categoria) => {
  try {
    const response = await axios.put(`<span class="math-inline">\{API\_URL\}/</span>{categoria.id}`, categoria);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};

const excluirCategoria = async (id) => {
  try {
    await axios.delete(`<span class="math-inline">\{API\_URL\}/</span>{id}`);
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    throw error;
  }
};

export default {
  criarCategoria,
  listarCategorias,
  atualizarCategoria,
  excluirCategoria,
};