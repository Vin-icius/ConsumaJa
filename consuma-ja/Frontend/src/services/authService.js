import { pessoaApiClient } from '../api/client'
import AsyncStorage from '@react-native-async-storage/async-storage'

const USER_TOKEN_KEY = 'userToken'
const USER_TYPE_KEY = 'userType'
const USER_INFO_KEY = 'userInfo'

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
    await AsyncStorage.setItem(USER_TOKEN_KEY, token)
    if (user?.tipo) await AsyncStorage.setItem(USER_TYPE_KEY, user.tipo)
    if (user) await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(user))
  } catch (e) {
    console.error('[AuthService] Erro ao salvar dados:', e)
    throw new Error('Erro ao salvar os dados da sessão.')
  }
}

const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([USER_TOKEN_KEY, USER_TYPE_KEY, USER_INFO_KEY])
  } catch (e) {
    console.error('[AuthService] Erro ao limpar dados:', e)
  }
}

const getToken = async () => {
  try {
    return await AsyncStorage.getItem(USER_TOKEN_KEY)
  } catch (e) {
    console.error('[AuthService] Erro ao obter token:', e)
    return null
  }
}

const getStoredUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(USER_INFO_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.error('[AuthService] Erro ao obter dados do usuário:', e)
    return null
  }
}

export default {
  login,
  storeAuthData,
  clearAuthData,
  getToken,
  getStoredUser,
}
