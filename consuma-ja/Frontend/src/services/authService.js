import { pessoaApiClient } from '../api/client'
import AsyncStorage from '@react-native-async-storage/async-storage'

const handleRequest = async (requestPromise) => {
  try {
    const response = await requestPromise
    return response.data
  } catch (error) {
    console.error(`[AuthService] Erro em ${error.config?.url}:`, error.response?.data || error.message || error)
    throw error
  }
}

const login = (credentials) => {
  return handleRequest(pessoaApiClient.post('/auth/login', credentials))
}

const storeAuthData = async (token, user) => {
  try {
    await AsyncStorage.setItem('userToken', token)
    if (user?.tipo) await AsyncStorage.setItem('userType', user.tipo)
  } catch (e) {
    console.error('[AuthService] Erro ao salvar dados:', e)
    throw new Error("Erro ao salvar os dados da sessão.")
  }
}

const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(['userToken', 'userType'])
  } catch (e) {
    console.error('[AuthService] Erro ao limpar dados:', e)
  }
}

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken')
  } catch (e) {
    console.error('[AuthService] Erro ao obter token:', e)
    return null
  }
}

export default {
  login,
  storeAuthData,
  clearAuthData,
  getToken,
}
