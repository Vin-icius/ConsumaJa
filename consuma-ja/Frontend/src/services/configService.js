import { pessoaApiClient } from '../api/client';

const logError = (error) => {
  const payload = error?.response?.data || error?.message || error;
  console.error('[ConfigService]', payload);
};

const handleRequest = async (requestPromise) => {
  try {
    const response = await requestPromise;
    return response.data;
  } catch (error) {
    logError(error);
    throw error;
  }
};

const handleRequestNoData = async (requestPromise) => {
  try {
    await requestPromise;
  } catch (error) {
    logError(error);
    throw error;
  }
};

const configService = {
  getConfiguracoesUsuario: (pessoaId) => handleRequest(pessoaApiClient.get(`/config/${pessoaId}`)),

  atualizarNotificacoes: (pessoaId, notificacoes) =>
    handleRequest(pessoaApiClient.put(`/config/${pessoaId}/notificacoes`, notificacoes)),

  alterarSenha: (pessoaId, dadosSenha) =>
    handleRequestNoData(pessoaApiClient.put(`/config/${pessoaId}/senha`, dadosSenha)),

  adicionarMetodoPagamento: (pessoaId, metodoPagamento) =>
    handleRequest(pessoaApiClient.post(`/config/${pessoaId}/pagamento`, metodoPagamento)),

  listarMetodosPagamento: (pessoaId) =>
    handleRequest(pessoaApiClient.get(`/config/${pessoaId}/pagamentos`)),

  atualizarMetodoPagamento: (pessoaId, pagamentoId, metodoPagamento) =>
    handleRequest(pessoaApiClient.put(`/config/${pessoaId}/pagamento/${pagamentoId}`, metodoPagamento)),

  definirMetodoPagamentoPrincipal: (pessoaId, pagamentoId) =>
    handleRequest(pessoaApiClient.patch(`/config/${pessoaId}/pagamento/${pagamentoId}/padrao`)),

  removerMetodoPagamento: (pessoaId, pagamentoId) =>
    handleRequestNoData(pessoaApiClient.delete(`/config/${pessoaId}/pagamento/${pagamentoId}`)),

  getHistoricoPagamentos: (pessoaId, page = 1, limit = 10) =>
    handleRequest(
      pessoaApiClient.get(`/config/${pessoaId}/historico-pagamentos`, {
        params: { page, limit },
      }),
    ),

  atualizarConfiguracao2FA: (pessoaId, habilitado) =>
    handleRequest(pessoaApiClient.put(`/config/${pessoaId}/2fa`, { habilitado })),

  gerarQRCode2FA: (pessoaId) => handleRequest(pessoaApiClient.get(`/config/${pessoaId}/2fa/qrcode`)),

  validarCodigo2FA: (pessoaId, codigo) =>
    handleRequest(pessoaApiClient.post(`/config/${pessoaId}/2fa/validar`, { codigo_2fa: codigo })),

  verificar2FAUsuario: (identificador) =>
    handleRequest(pessoaApiClient.get(`/config/verificar-2fa/${encodeURIComponent(identificador)}`)),
};

export default configService;
