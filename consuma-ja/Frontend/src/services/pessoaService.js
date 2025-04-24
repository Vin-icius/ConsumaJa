// src/services/pessoaService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// !!!!! VERIFIQUE SE ESTA URL BASE ESTÁ CORRETA !!!!!
// (IP da sua máquina, Porta do pessoa-service, Caminho base '/api')
const API_URL_BASE = 'http://localhost:3002/api';

// Funções auxiliares para tratamento de erro
const handleRequest = async (requestPromise) => {
  try {
    const response = await requestPromise;
    return response.data;
  } catch (error) {
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    console.error(`Erro API (Pessoa): ${method} ${url}`, error.response?.data || error.message || error);
    throw error;
  }
};
const handleRequestNoData = async (requestPromise) => {
    try {
        await requestPromise;
    } catch (error) {
        const method = error.config?.method?.toUpperCase();
        const url = error.config?.url;
        console.error(`Erro API (Pessoa): ${method} ${url}`, error.response?.data || error.message || error);
        throw error;
    }
};

/**
 * Registra um novo usuário (Pessoa + Fisica/Juridica + Endereco) - sem fotos.
 */
const registrar = (userData) => {
    // POST /api/pessoa/registrar
    return handleRequest(axios.post(`${API_URL_BASE}/pessoa/registrar`, userData));
};

/**
 * Faz upload de uma foto (selfie ou documento) para um usuário existente.
 */
const uploadFoto = async (pessoaId, tipoFoto, imageUri) => {
    if (!imageUri) {
        throw new Error(`URI da imagem (${tipoFoto}) não fornecido.`);
    }

    const formData = new FormData();
    const filename = imageUri.split('/').pop() || `photo_${tipoFoto}.jpg`; // Nome padrão
    const match = /\.(\w+)$/.exec(filename);
    // Mapeia extensões comuns, default para jpeg se desconhecido
    let imageType = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(imageType)) {
        console.warn(`Tipo de imagem não padrão detectado: ${imageType}, usando image/jpeg.`);
        imageType = 'image/jpeg'; // Garante um tipo válido para o backend/multer
    }


    // <<< CORREÇÃO: Remover 'as any' >>>
    // Adiciona o arquivo ao FormData. A chave 'foto' deve corresponder ao upload.single('foto') no backend.
    formData.append('foto', {
        uri: imageUri,
        name: filename,
        type: imageType // Usa o tipo de imagem determinado
    });
    // ----------------------------------

    console.log(`[pessoaService] Enviando ${tipoFoto} para user ${pessoaId} com nome ${filename} e tipo ${imageType}...`);
    const endpoint = `${API_URL_BASE}/pessoa/${pessoaId}/upload/${tipoFoto}`;

    try {
        // Enviar como multipart/form-data
        const response = await axios.post(endpoint, formData, {
            headers: {
                // 'Content-Type': 'multipart/form-data', // Axios geralmente define isso automaticamente para FormData
                // Adicionar token de autenticação se necessário
                // 'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
            },
             // Opcional: callback de progresso de upload
             // onUploadProgress: (progressEvent) => {
             //   let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
             //   console.log(`Upload ${tipoFoto}: ${percentCompleted}%`);
             // }
        });
        return response.data;
    } catch (error) {
         console.error(`Erro no upload da ${tipoFoto} para user ${pessoaId}:`, error.response?.data || error.message || error);
         throw error;
    }
};

/**
 * Lista pessoas (com filtros opcionais).
 */
const listarPessoas = (params = {}) => {
    // GET /api/pessoa
    return handleRequest(axios.get(`${API_URL_BASE}/pessoa`, { params }));
};

/**
 * Busca uma pessoa pelo ID.
 */
const buscarPessoaPorId = (id) => {
     // GET /api/pessoa/:id
     return handleRequest(axios.get(`${API_URL_BASE}/pessoa/${id}`));
};

/**
 * Atualiza os dados de uma pessoa.
 */
const atualizarPessoa = (id, pessoaData) => {
     // PUT /api/pessoa/:id
     return handleRequest(axios.put(`${API_URL_BASE}/pessoa/${id}`, pessoaData));
};

/**
 * Exclui (logicamente) uma pessoa.
 */
const excluirPessoa = (id) => {
     // DELETE /api/pessoa/:id
     return handleRequestNoData(axios.delete(`${API_URL_BASE}/pessoa/${id}`));
};

// Exporta o objeto do serviço
const pessoaService = {
    registrar,
    uploadFoto,
    listarPessoas,
    buscarPessoaPorId,
    atualizarPessoa,
    excluirPessoa,
};

export default pessoaService;