import { pessoaApiClient } from '../api/client'

const handleRequest = async (requestPromise) => {
  try {
    return (await requestPromise).data
  } catch (error) {
    console.error('[ConfigService]', error.response?.data || error.message || error)
    throw error
  }
}

const handleRequestNoData = async (requestPromise) => {
  try {
    await requestPromise
  } catch (error) {
    console.error('[ConfigService]', error.response?.data || error.message || error)
    throw error
  }
}

const configService = {
  // Obter configurações do usuário
  getConfiguracoesUsuario: (pessoaId) =>
    handleRequest(pessoaApiClient.get(`/config/${pessoaId}`)),

  // Atualizar preferências de notificação
  atualizarNotificacoes: (pessoaId, notificacoes) =>
    handleRequest(pessoaApiClient.put(`/config/${pessoaId}/notificacoes`, notificacoes)),

  // Alterar senha
  alterarSenha: (pessoaId, dadosSenha) =>
    handleRequestNoData(pessoaApiClient.put(`/config/${pessoaId}/senha`, dadosSenha)),

  // Adicionar método de pagamento
  adicionarMetodoPagamento: (pessoaId, metodoPagamento) =>
    handleRequest(pessoaApiClient.post(`/config/${pessoaId}/pagamento`, metodoPagamento)),

  // Listar métodos de pagamento
  listarMetodosPagamento: (pessoaId) =>
    handleRequest(pessoaApiClient.get(`/config/${pessoaId}/pagamentos`)),

  // Remover método de pagamento
  removerMetodoPagamento: (pessoaId, pagamentoId) => {
    console.log('configService.removerMetodoPagamento chamado:', { pessoaId, pagamentoId });
    return handleRequestNoData(pessoaApiClient.delete(`/config/${pessoaId}/pagamento/${pagamentoId}`));
  },

  // Obter histórico de pagamentos
  getHistoricoPagamentos: (pessoaId, page = 1, limit = 10) =>
    handleRequest(pessoaApiClient.get(`/config/${pessoaId}/historico-pagamentos`, {
      params: { page, limit }
    })),

  // Atualizar configuração 2FA
  atualizarConfiguracao2FA: (pessoaId, habilitado) =>
    handleRequest(pessoaApiClient.put(`/config/${pessoaId}/2fa`, { habilitado })),

  // Gerar QR Code para 2FA
  gerarQRCode2FA: (pessoaId) =>
    handleRequest(pessoaApiClient.get(`/config/${pessoaId}/2fa/qrcode`)),

  // Validar código 2FA
  validarCodigo2FA: (pessoaId, codigo) =>
    handleRequest(pessoaApiClient.post(`/config/${pessoaId}/2fa/validar`, { codigo_2fa: codigo })),

  // Verificar se usuário tem 2FA habilitado (usando identificador de login)
  verificar2FAUsuario: (identificador) =>
    handleRequest(pessoaApiClient.get(`/config/verificar-2fa/${encodeURIComponent(identificador)}`)),
}

export default configService