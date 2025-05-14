import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// !!!!! SUBSTITUA 'SEU_IP_LOCAL_AQUI' PELO SEU IP LOCAL REAL !!!!!
// !!!!! CONFIRME SE A PORTA 3002 (ou outra) ESTÁ CORRETA PARA O pessoa-service !!!!!
// !!!!! CONFIRME SE O CAMINHO BASE '/api' ESTÁ CORRETO (conforme main.ts do pessoa-service) !!!!!
<<<<<<< HEAD
const API_URL_BASE = 'http://172.20.0.13:3002/api'; // Base da API do Pessoa Service
=======
const API_URL_BASE = 'http://172.16.241.5:3002/api'; // Base da API do Pessoa Service
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)

// Função auxiliar para tratar requests que esperam dados de volta
const handleRequest = async (requestPromise) => {
  try {
    const response = await requestPromise;
    return response.data; // Retorna apenas os dados da resposta
  } catch (error) {
    // Log detalhado do erro (o interceptor faria isso se estivéssemos usando o cliente centralizado)
    console.error(`Erro na chamada API (Auth) para ${error.config?.url}:`, error.response?.data || error.message || error);
    throw error; // Relança o erro original para a tela tratar (ex: mostrar Alert)
  }
};

/**
 * Tenta autenticar um usuário no backend.
 * @param {object} credentials - Objeto contendo login e senha.
 * @param {string} credentials.login - O identificador do usuário (login, email, CPF, CNPJ).
 * @param {string} credentials.senha - A senha do usuário.
 * @returns {Promise<object>} - Promise que resolve com os dados da resposta (token, user info).
 */
const login = async (credentials) => {
  // O endpoint completo é baseURL + '/auth/login'
  // (baseado na montagem apiRouter.use('/auth', authRoutes) no main.ts do pessoa-service)
  return handleRequest(axios.post(`${API_URL_BASE}/auth/login`, credentials));
};

// --- Funções Adicionais (Exemplos) ---

/**
 * Salva os dados de autenticação no AsyncStorage.
 * @param {string} token - O token JWT recebido.
 * @param {object} user - O objeto de usuário recebido.
 */
const storeAuthData = async (token, user) => {
    try {
        await AsyncStorage.setItem('userToken', token);
        if (user && user.tipo) {
            await AsyncStorage.setItem('userType', user.tipo);
        }
        // Pode salvar outras informações do usuário se necessário
        // await AsyncStorage.setItem('userData', JSON.stringify(user));
        console.log('[AuthService] Dados de autenticação salvos.');
    } catch (e) {
        console.error('[AuthService] Erro ao salvar dados de autenticação:', e);
        // Lançar erro ou tratar como apropriado
        throw new Error("Não foi possível salvar os dados da sessão.");
    }
};

/**
 * Limpa os dados de autenticação do AsyncStorage.
 */
const clearAuthData = async () => {
     try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userType');
        // await AsyncStorage.removeItem('userData');
        console.log('[AuthService] Dados de autenticação removidos.');
    } catch (e) {
        console.error('[AuthService] Erro ao limpar dados de autenticação:', e);
        // Lançar erro ou tratar
    }
};

/**
 * Recupera o token do AsyncStorage (útil para interceptors ou checagens).
 * @returns {Promise<string|null>} O token ou null.
 */
const getToken = async () => {
    try {
        return await AsyncStorage.getItem('userToken');
    } catch (e) {
        console.error('[AuthService] Erro ao recuperar token:', e);
        return null;
    }
};

// Exporta as funções do serviço
const authService = {
  login,
  storeAuthData,
  clearAuthData,
  getToken,
  // Adicionar register, forgotPassword, etc., aqui quando implementar
};

export default authService;