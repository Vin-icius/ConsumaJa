import { productApiClient, locationApiClient, pessoaApiClient } from "../api/client" // Importa os clients configurados

// Funções auxiliares para tratamento de erro
const handleRequest = async (requestPromise) => {
  try {
    const response = await requestPromise
    return response.data // Axios já coloca a resposta em 'data'
  } catch (error) {
    const errConfig = error.config || {} // Para obter informações da requisição que falhou
    const target = `${errConfig.method?.toUpperCase()} ${errConfig.baseURL ? errConfig.baseURL + (errConfig.url || "") : errConfig.url || "URL desconhecida"}`
    console.error(`Erro API Service: ${target}`, error.response?.data || error.message || error)
    throw error // Relança o erro para ser tratado pela tela/componente
  }
}

// Helper para requests que não esperam dados no corpo da resposta bem-sucedida (ex: DELETE)
const handleRequestNoData = async (requestPromise) => {
  try {
    await requestPromise // Só espera a promise resolver
    return true // Ou algum indicador de sucesso
  } catch (error) {
    const errConfig = error.config || {}
    const target = `${errConfig.method?.toUpperCase()} ${errConfig.baseURL ? errConfig.baseURL + (errConfig.url || "") : errConfig.url || "URL desconhecida"}`
    console.error(`Erro API Service (NoData): ${target}`, error.response?.data || error.message || error)
    throw error
  }
}

// --- Funções CRUD de Promoção (usam productApiClient) ---
const listarPromocoes = (params = {}) => {
  return handleRequest(productApiClient.get(`/promocoes`, { params }))
}

const getPromocaoDetalhes = (promocaoId) => {
  return handleRequest(productApiClient.get(`/promocoes/${promocaoId}`))
}

const criarPromocao = (promocaoData) => {
  return handleRequest(productApiClient.post(`/promocoes`, promocaoData))
}

const atualizarPromocao = (id, promocaoData) => {
  return handleRequest(productApiClient.put(`/promocoes/${id}`, promocaoData))
}

const excluirPromocao = (id) => {
  return handleRequestNoData(productApiClient.delete(`/promocoes/${id}`))
}

// --- Funções CRUD de Lotes (usam productApiClient) ---
const listarLotes = (params = {}) => {
  return handleRequest(productApiClient.get(`/lotes`, { params }))
}

const buscarLotePorId = (loteId) => {
  return handleRequest(productApiClient.get(`/lotes/${loteId}`))
}

const criarLote = (loteData) => {
  return handleRequest(productApiClient.post(`/lotes`, loteData))
}

const atualizarLote = (id, loteData) => {
  return handleRequest(productApiClient.put(`/lotes/${id}`, loteData))
}

const excluirLote = (id) => {
  return handleRequestNoData(productApiClient.delete(`/lotes/${id}`))
}

// --- Funções Auxiliares para o Formulário de Promoções ---
const listarFornecedoresAtivos = (params = {}) => {
  // params pode incluir nomeQuery, page, limit
  console.log("[PromocaoService] Buscando fornecedores com params:", params)
  return handleRequest(
    pessoaApiClient.get("/pessoa", {
      params: {
        pessoa_tipo: "Juridica",
        pessoa_status: 1, // Ou 'ativo': true, dependendo do seu backend pessoa-service
        ...params, // Espalha nomeQuery, page, limit, etc.
      },
    }),
  )
}

const listarEnderecosPorFornecedor = (fornecedorId) => {
  console.log(`[PromocaoService] Buscando endereços para fornecedor ${fornecedorId}`)
  // Usar locationApiClient para buscar endereços reais
  return handleRequest(
    locationApiClient.get(`/enderecos`, {
      params: {
        pessoaId: fornecedorId,
        // Adicione outros parâmetros conforme necessário para sua API
        ativo: true, // Assumindo que queremos apenas endereços ativos
      },
    }),
  )
}

const buscarProdutosParaSelecao = (filtros = {}) => {
  // filtros = { nomeQuery, categoriaId, marcaId, tipoId, fornecedorId, page, limit }
  console.log("[PromocaoService] Buscando produtos para seleção com filtros:", filtros)
  return handleRequest(productApiClient.get(`/produtos/para-selecao-promocao`, { params: filtros }))
}

// Função buscarLotesPorProduto - Ajustada para filtrar apenas lotes do produto específico
const buscarLotesPorProduto = (produtoId, fornecedorId) => {
  console.log(`[PromocaoService] Buscando lotes para produto ${produtoId} do fornecedor ${fornecedorId}`)
  return handleRequest(
    productApiClient.get(`/lotes/disponiveis`, {
      params: {
        produtoId: produtoId,
        fornecedorId: fornecedorId,
        apenasComEstoque: true,
        apenasNaoVencidos: true,
        // Garantir que apenas lotes do produto específico sejam retornados
        filtrarPorProduto: true,
      },
    }),
  )
}

// Função para finalizar venda/promocao
const finalizarVenda = (saleData) => {
  console.log('[PromocaoService] Finalizando venda com dados:', saleData)
  return handleRequest(productApiClient.post(`/promocoes/sale`, saleData))
}

// Função para buscar todos os produtos (para o formulário de lotes)
const listarTodosProdutos = (params = {}) => {
  return handleRequest(productApiClient.get(`/produtos`, { params }))
}

const promocaoService = {
  // Promoções
  listarPromocoes,
  getPromocaoDetalhes,
  criarPromocao,
  atualizarPromocao,
  excluirPromocao,
  
  // Lotes
  listarLotes,
  buscarLotePorId,
  criarLote,
  atualizarLote,
  excluirLote,
  buscarLotesPorProduto,
  
  // Vendas
  finalizarVenda,
  
  // Auxiliares
  listarFornecedoresAtivos,
  listarEnderecosPorFornecedor,
  buscarProdutosParaSelecao,
  listarTodosProdutos,
}

export default promocaoService
