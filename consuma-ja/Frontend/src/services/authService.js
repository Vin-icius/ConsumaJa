import { pessoaApiClient } from '../api/client'

const handleRequest = async (requestPromise) => {
  try {
    const response = await requestPromise
    return response.data
  } catch (error) {
    console.error(`[AuthService] Erro em ${error.config?.url}:`, error.response?.data || error.message || error)
    throw error
  }
}

const login = (credentials) => handleRequest(pessoaApiClient.post('/auth/login', credentials))

const validarSessao = (sessaoId) =>
  handleRequest(pessoaApiClient.post('/auth/sessao/validar', { sessao_id: sessaoId }))

const encerrarSessao = (sessaoId) =>
  handleRequest(pessoaApiClient.post('/auth/logout', { sessao_id: sessaoId }))

const verifyTwoFactor = (token, codigo) =>
  handleRequest(
    pessoaApiClient.post('/auth/verify-2fa', {
      token,
      codigo_2fa: codigo,
    }),
  )

export default {
  login,
  validarSessao,
  encerrarSessao,
  verifyTwoFactor,
}
