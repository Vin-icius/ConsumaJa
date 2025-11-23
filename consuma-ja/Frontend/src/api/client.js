import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOCATION_API_URL, PRODUCT_API_URL, PERSON_API_URL, ORDER_API_URL } from '../constants/api';

// --- Instância para Location Service ---
const locationApiClient = axios.create({
  baseURL: LOCATION_API_URL,
  headers: { Accept: 'application/json' },
});

// --- Instância para Product Service ---
const productApiClient = axios.create({
  baseURL: PRODUCT_API_URL,
  headers: { Accept: 'application/json' },
});

// --- Instância para Pessoa Service ---
const pessoaApiClient = axios.create({
  baseURL: PERSON_API_URL, // <<< USA A NOVA URL BASE
  headers: { Accept: 'application/json' },
});

// --- Instância para Order Service ---
const orderApiClient = axios.create({
  baseURL: ORDER_API_URL, // <<< USA A NOVA URL BASE
  headers: { Accept: 'application/json' },
});

// --- Interceptores ---

// Interceptor para adicionar Token JWT (Deve ser aplicado aos clientes que precisam dele)
const addAuthTokenInterceptor = (client) => {
  client.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('userToken');
      if (token && !config.url?.includes('/auth/login')) {
        console.log('[API Interceptor] Adicionando token à requisição para:', config.url);
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error)
  );
};

// Aplicar interceptor aos clientes que acessarão rotas protegidas
// addAuthTokenInterceptor(locationApiClient); // Aplicar se location tiver rotas protegidas
addAuthTokenInterceptor(productApiClient); // Aplicar se product tiver rotas protegidas
addAuthTokenInterceptor(orderApiClient);
// Não aplicar em pessoaApiClient se /auth/login for a única rota ou se ele tiver rotas públicas e protegidas

// Interceptor de Resposta para Erros
const setupErrorInterceptor = (client) => {
    client.interceptors.response.use(
        response => response,
        error => {
            const { config, response, request, message } = error;
            console.error(`[API Client Error] Request to ${config?.baseURL}${config?.url} failed`); // Log aprimorado
            if (response) { console.error(`> Status: ${response.status} ${response.statusText}`); console.error('> Data:', response.data); }
            else if (request) { console.error('> Error: No Response Received (Network Error or Timeout)'); console.error('> Message:', message); }
            else { console.error('> Error setting up request:', message); }
            return Promise.reject(error);
        }
    );
};

// Aplicar interceptor de erro a TODOS os clientes
setupErrorInterceptor(locationApiClient);
setupErrorInterceptor(productApiClient);
setupErrorInterceptor(pessoaApiClient);
setupErrorInterceptor(orderApiClient);


// --- Exportar as instâncias ---
export { locationApiClient, productApiClient, pessoaApiClient, orderApiClient };