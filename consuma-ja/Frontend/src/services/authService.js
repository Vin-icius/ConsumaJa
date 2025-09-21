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
    console.log('[AuthService] storeAuthData - token:', token)
    console.log('[AuthService] storeAuthData - user object:', user)

    await AsyncStorage.setItem('userToken', token)

    // Mapear campos do usuário - tentar diferentes formatos
    const userId = user?.pessoa_id || user?.id || user?.userId
    const userType = user?.tipo || user?.userType || user?.role
    const userName = user?.pessoa_nome || user?.nome || user?.name || user?.userName
    const userEmail = user?.pessoa_email || user?.email || user?.userEmail

    console.log('[AuthService] Mapped fields - userId:', userId, 'userType:', userType, 'userName:', userName, 'userEmail:', userEmail)

    if (userId) await AsyncStorage.setItem('userId', userId.toString())
    if (userType) await AsyncStorage.setItem('userType', userType)
    if (userName) await AsyncStorage.setItem('userName', userName)
    if (userEmail) await AsyncStorage.setItem('userEmail', userEmail)

    console.log('[AuthService] storeAuthData - data stored successfully')
  } catch (e) {
    console.error('[AuthService] Erro ao salvar dados:', e)
    throw new Error("Erro ao salvar os dados da sessão.")
  }
}

const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(['userToken', 'userType', 'userId', 'userName', 'userEmail'])
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

const getCurrentUser = async () => {
  try {
    const [userId, userType, userName, userEmail] = await AsyncStorage.multiGet([
      'userId', 'userType', 'userName', 'userEmail'
    ])
    return {
      pessoa_id: userId[1] ? parseInt(userId[1]) : null,
      tipo: userType[1] || null,
      pessoa_nome: userName[1] || null,
      pessoa_email: userEmail[1] || null,
    }
  } catch (e) {
    console.error('[AuthService] Erro ao obter dados do usuário:', e)
    return null
  }
}

const verifyTwoFactor = (tempToken, code) => {
  return handleRequest(pessoaApiClient.post('/auth/verify-2fa', { tempToken, code }))
}

export default {
  login,
  storeAuthData,
  clearAuthData,
  getToken,
  getCurrentUser,
  verifyTwoFactor,
}
