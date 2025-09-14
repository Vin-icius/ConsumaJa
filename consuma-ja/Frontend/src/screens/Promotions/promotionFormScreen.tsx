"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  Image,
  Keyboard,
  Platform,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DatePicker from '../../components/Common/datePicker/DatePicker';
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import promocaoService from "../../services/promocaoService"
import { promotionFormStyles } from "../../common/styles/Promotions/promotionFormScreen.styled"

// Tipos
interface Fornecedor {
  pessoa_id: number
  pessoa_nome: string
}

interface Endereco {
  endereco_id: number
  rua: string
  numero: string
  cidade?: { cidade_nome?: string }
  bairro?: string
  complemento?: string
  cep?: string
}

interface Produto {
  produto_id: number
  produto_nome: string
  produto_imagem_url?: string | null
  produto_preco?: number
}

interface LoteDisponivel {
  lote_id: number
  lote_codigo: string
  produto_id: number
  produto_nome: string
  lote_quantidade_atual: number
  lote_validade: string
}

interface ItemPromocao {
  id: string
  produto_id: number
  produto_nome: string
  LOTEPROD_lote_id: number
  itemPromocao_qtde: string
  itemPromocao_valor: string
  produto_imagem_url?: string | null
  lote_display_nome?: string
  lote_estoque_disponivel?: number
}

interface PromocaoForm {
  promocao_descricao: string
  inicio: Date
  fim: Date
  JURIDICA_PESSOA_pessoa_id?: number
  endereco_id?: number
  itens: ItemPromocao[]
}

const ITEMS_PER_PAGE = 10
const MAX_PRODUTOS = 15

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const PromotionFormScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const promocaoIdParaEditar = route.params?.promocaoId
  const isEditing = !!promocaoIdParaEditar
  const dateInputRefValidade = useRef<TextInput>(null)

  // Estado principal do formulário
  const [formData, setFormData] = useState<PromocaoForm>({
    promocao_descricao: "",
    inicio: new Date(),
    fim: new Date(new Date().setDate(new Date().getDate() + 7)),
    JURIDICA_PESSOA_pessoa_id: undefined,
    endereco_id: undefined,
    itens: [],
  })

  // Estados para busca de fornecedor
  const [fornecedorQuery, setFornecedorQuery] = useState("")
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null)
  const [loadingFornecedores, setLoadingFornecedores] = useState(false)
  const [fornecedorPage, setFornecedorPage] = useState(1)
  const [fornecedorTotalPages, setFornecedorTotalPages] = useState(0)
  const [fornecedorTotal, setFornecedorTotal] = useState(0)
  const [showFornecedores, setShowFornecedores] = useState(false)

  // Estados para endereços
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  const [loadingEnderecos, setLoadingEnderecos] = useState(false)

  // Estados para busca de produtos
  const [produtoQuery, setProdutoQuery] = useState("")
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  const [produtoPage, setProdutoPage] = useState(1)
  const [produtoTotalPages, setProdutoTotalPages] = useState(0)
  const [produtoTotal, setProdutoTotal] = useState(0)
  const [showProdutos, setShowProdutos] = useState(false)

  // Estados para seleção de datas
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState<"inicio" | "fim">("inicio")

  // Estados para modal de produto
  const [modalVisible, setModalVisible] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [lotesDoProduto, setLotesDoProduto] = useState<LoteDisponivel[]>([])
  const [loteSelecionado, setLoteSelecionado] = useState<LoteDisponivel | null>(null)
  const [itemQuantidade, setItemQuantidade] = useState("1")
  const [itemValor, setItemValor] = useState("")
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  // Estado para criação de lote
  const [createBatchMode, setCreateBatchMode] = useState(false)
  const [batchFormData, setBatchFormData] = useState({
    lote_codigo: "",
    lote_validade: null as Date | null,
    lote_quantidade_inicial: "1",
    lote_quantidade_atual: "1",
  })
  const [showBatchDatePicker, setShowBatchDatePicker] = useState(false)
  const [batchValidadeInput, setBatchValidadeInput] = useState("")

  // Estado de loading geral
  const [loading, setLoading] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Carregar dados iniciais para edição
  useEffect(() => {
    const loadInitialData = async () => {
      if (isEditing && promocaoIdParaEditar) {
        setLoading(true)
        try {
          console.log(`[PromocaoForm] Editando. ID: ${promocaoIdParaEditar}`)
          const promoDetalhes = await promocaoService.getPromocaoDetalhes(promocaoIdParaEditar)

          if (promoDetalhes) {
            const fornecedorAtual =
              promoDetalhes.fornecedor ||
              (promoDetalhes.JURIDICA_PESSOA_pessoa_id
                ? { pessoa_id: promoDetalhes.JURIDICA_PESSOA_pessoa_id, pessoa_nome: "Carregando..." }
                : null)

            if (fornecedorAtual && (!fornecedorAtual.pessoa_nome || fornecedorAtual.pessoa_nome === "Carregando...") && promoDetalhes.JURIDICA_PESSOA_pessoa_id) {
              // Como o serviço listarFornecedoresAtivos não suporta busca por ID específico,
              // vamos definir um nome padrão por enquanto
              fornecedorAtual.pessoa_nome = `Fornecedor ID: ${promoDetalhes.JURIDICA_PESSOA_pessoa_id}`
            }

            setFornecedorSelecionado(fornecedorAtual)

            setFormData({
              promocao_descricao: promoDetalhes.promocao_descricao || "",
              inicio: promoDetalhes.inicio ? new Date(promoDetalhes.inicio) : new Date(),
              fim: promoDetalhes.fim
                ? new Date(promoDetalhes.fim)
                : new Date(new Date().setDate(new Date().getDate() + 7)),
              JURIDICA_PESSOA_pessoa_id: promoDetalhes.JURIDICA_PESSOA_pessoa_id,
              endereco_id: promoDetalhes.endereco_id,
              itens: (promoDetalhes.itens || []).map((item: any) => {
                // Garantir que os valores sejam strings válidas
                const qtd = item.itemPromocao_qtde
                const valor = item.itemPromocao_valor

                return {
                  id: generateTempId(),
                  produto_id: item.produto?.produto_id,
                  produto_nome: item.produto?.produto_nome || "Produto Desconhecido",
                  produto_imagem_url: item.produto?.produto_imagem_url,
                  LOTEPROD_lote_id: item.LOTEPROD_lote_id || item.lote?.lote_id,
                  itemPromocao_qtde: (typeof qtd === 'number' ? qtd.toString() : qtd?.toString() || "").replace(".", ","),
                  itemPromocao_valor: (typeof valor === 'number' ? valor.toString() : valor?.toString() || "").replace(".", ","),
                  lote_display_nome: `${item.lote?.lote_codigo || 'N/A'} (Val: ${item.lote?.lote_validade ? new Date(item.lote.lote_validade).toLocaleDateString() : "N/A"})`,
                  lote_estoque_disponivel: item.lote?.lote_quantidade_atual,
                }
              }),
            })

            navigation.setOptions({ title: `Editar: ${promoDetalhes.promocao_descricao || "Promoção"}` })

            if (promoDetalhes.JURIDICA_PESSOA_pessoa_id) {
              await handleFornecedorChange(promoDetalhes.JURIDICA_PESSOA_pessoa_id, false)
            }
          } else {
            throw new Error("Promoção não encontrada.")
          }
        } catch (error) {
          console.error("Erro loadInitialData:", error)
          Alert.alert("Erro", "Dados iniciais não puderam ser carregados.")
        } finally {
          setLoading(false)
        }
      } else {
        navigation.setOptions({ title: "Nova Promoção" })
      }
    }

    loadInitialData()
  }, [isEditing, promocaoIdParaEditar, navigation])

  // Buscar fornecedores
  const buscarFornecedores = useCallback(
    async (page = 1, append = false) => {
      if (!fornecedorQuery.trim() && page === 1 && !isEditing) {
        setFornecedores([])
        setShowFornecedores(false)
        return
      }

      setLoadingFornecedores(true)
      try {
        const params: any = { page, limit: ITEMS_PER_PAGE }
        if (fornecedorQuery.trim()) params.nomeQuery = fornecedorQuery.trim()

        const result = await promocaoService.listarFornecedoresAtivos(params)

        if (result && result.data && result.data.length > 0) {
          setFornecedores(append ? [...fornecedores, ...result.data] : result.data)
          setFornecedorPage(result.page || 1)
          setFornecedorTotalPages(result.totalPages || 0)
          setFornecedorTotal(result.total || 0)
          setShowFornecedores(true)
        } else if (!append) {
          setFornecedores([])
          Alert.alert("Busca", "Nenhum fornecedor encontrado.")
        }
      } catch (error) {
        console.error("Erro ao buscar fornecedores:", error)
        Alert.alert("Erro", "Não foi possível buscar fornecedores.")
        if (!append) setFornecedores([])
      } finally {
        setLoadingFornecedores(false)
      }
    },
    [fornecedorQuery, fornecedores, isEditing],
  )

  // Buscar endereços do fornecedor
  const buscarEnderecos = useCallback(
    async (fornecedorId: number) => {
      if (!fornecedorId) return

      setLoadingEnderecos(true)
      try {
        const result = await promocaoService.listarEnderecosPorFornecedor(fornecedorId)

        // Tratamento para diferentes formatos de resposta da API
        let enderecosData: Endereco[] = []

        if (Array.isArray(result)) {
          // Se a API retornar diretamente um array de endereços
          enderecosData = result
        } else if (result && result.data && Array.isArray(result.data)) {
          // Se a API retornar um objeto com propriedade data contendo o array
          enderecosData = result.data
        } else if (result && typeof result === "object") {
          // Caso seja um único objeto de endereço
          enderecosData = [result]
        }

        console.log(`[PromocaoForm] Endereços carregados: ${enderecosData.length}`)
        setEnderecos(enderecosData)

        // Se houver apenas um endereço, seleciona automaticamente
        if (enderecosData.length === 1) {
          setFormData((prev) => ({
            ...prev,
            endereco_id: enderecosData[0].endereco_id,
          }))
        }
        // Se houver múltiplos endereços e nenhum selecionado, seleciona o primeiro
        else if (enderecosData.length > 0 && !formData.endereco_id) {
          setFormData((prev) => ({
            ...prev,
            endereco_id: enderecosData[0].endereco_id,
          }))
        }
      } catch (error) {
        console.error("Erro ao buscar endereços:", error)
        Alert.alert("Erro", "Não foi possível carregar os endereços do fornecedor.")
        setEnderecos([])
      } finally {
        setLoadingEnderecos(false)
      }
    },
    [formData.endereco_id],
  )

  // Buscar produtos
  const buscarProdutos = useCallback(
    async (page = 1, append = false) => {
      if (!formData.JURIDICA_PESSOA_pessoa_id) {
        Alert.alert("Atenção", "Selecione um fornecedor primeiro.")
        return
      }

      if (!produtoQuery.trim() && page === 1) {
        setProdutos([])
        setShowProdutos(false)
        return
      }

      setLoadingProdutos(true)
      try {
        const filtros: any = {
          nomeQuery: produtoQuery.trim(),
          fornecedorId: formData.JURIDICA_PESSOA_pessoa_id,
          page,
          limit: ITEMS_PER_PAGE,
        }

        const result = await promocaoService.buscarProdutosParaSelecao(filtros)

        if (result && result.data && result.data.length > 0) {
          setProdutos(append ? [...produtos, ...result.data] : result.data)
          setProdutoPage(result.page || 1)
          setProdutoTotalPages(result.totalPages || 0)
          setProdutoTotal(result.total || 0)
          setShowProdutos(true)
        } else if (!append) {
          setProdutos([])
          Alert.alert("Busca", "Nenhum produto encontrado.")
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        Alert.alert("Erro", "Não foi possível buscar produtos.")
        if (!append) setProdutos([])
      } finally {
        setLoadingProdutos(false)
      }
    },
    [produtoQuery, produtos, formData.JURIDICA_PESSOA_pessoa_id],
  )

  // Selecionar fornecedor
  const selecionarFornecedor = (fornecedor: Fornecedor) => {
    setFornecedorSelecionado(fornecedor)
    setFormData((prev) => ({
      ...prev,
      JURIDICA_PESSOA_pessoa_id: fornecedor.pessoa_id,
      endereco_id: undefined,
      itens: [], // Limpa itens ao trocar fornecedor
    }))
    setShowFornecedores(false)
    setFornecedorQuery("")
    handleFornecedorChange(fornecedor.pessoa_id, true)
    // Usando a API Keyboard padrão do React Native
    Keyboard.dismiss()
  }

  // Atualizar dados após selecionar fornecedor
  const handleFornecedorChange = useCallback(
    async (fornecedorId: number, resetItens = true) => {
      const fornecedorSelecionadoObj = fornecedores.find((f) => f.pessoa_id === fornecedorId) || fornecedorSelecionado
      setFornecedorSelecionado(fornecedorSelecionadoObj)

      setFormData((prev) => ({
        ...prev,
        JURIDICA_PESSOA_pessoa_id: fornecedorId,
        endereco_id: undefined,
        itens: resetItens ? [] : prev.itens,
      }))

      setEnderecos([])
      setProdutos([])
      setProdutoQuery("")

      if (fornecedorId) {
        // Buscar endereços do fornecedor
        await buscarEnderecos(fornecedorId)
      }
    },
    [fornecedores, fornecedorSelecionado, buscarEnderecos],
  )

  // Remover fornecedor
  const removerFornecedor = () => {
    setFornecedorSelecionado(null)
    setFormData((prev) => ({
      ...prev,
      JURIDICA_PESSOA_pessoa_id: undefined,
      endereco_id: undefined,
      itens: [],
    }))
    setEnderecos([])
    setProdutos([])
    setLotesDoProduto([])
  }

  // Formatar endereço para exibição
  const formatarEnderecoDisplay = (endereco: Endereco) => {
    let enderecoFormatado = `${endereco.rua}, ${endereco.numero}`

    if (endereco.bairro) {
      enderecoFormatado += ` - ${endereco.bairro}`
    }

    if (endereco.cidade?.cidade_nome) {
      enderecoFormatado += ` - ${endereco.cidade.cidade_nome}`
    }

    if (endereco.cep) {
      enderecoFormatado += ` (CEP: ${endereco.cep})`
    }

    return enderecoFormatado
  }

  // Abrir modal para adicionar produto
  const abrirModalProduto = useCallback(
    async (produto: Produto, editar = false, itemId?: string) => {
      if (!formData.JURIDICA_PESSOA_pessoa_id) return

      setProdutoSelecionado(produto)
      setLotesDoProduto([])
      setLoteSelecionado(null)
      setCreateBatchMode(false) // Reset to select mode

      // Reset batch form data
      setBatchFormData({
        lote_codigo: "",
        lote_validade: null as Date | null,
        lote_quantidade_inicial: "1",
        lote_quantidade_atual: "1",
      })
      setBatchValidadeInput("")

      if (editar && itemId) {
        const item = formData.itens.find((i) => i.id === itemId)
        if (item) {
          setItemQuantidade(item.itemPromocao_qtde)
          setItemValor(item.itemPromocao_valor)
          setEditingItemId(itemId)
        }
      } else {
        setItemQuantidade("1")
        setItemValor(produto.produto_preco ? produto.produto_preco.toString().replace(".", ",") : "")
        setEditingItemId(null)
      }

      setLoading(true)
      try {
        // Buscar lotes específicos para o produto selecionado
        const lotes = await promocaoService.buscarLotesPorProduto(
          produto.produto_id,
          formData.JURIDICA_PESSOA_pessoa_id,
        )

        // Verificar se há lotes retornados
        if (lotes && Array.isArray(lotes) && lotes.length > 0) {
          // Filtrar apenas lotes que correspondem ao produto_id selecionado
          const lotesFiltrados = lotes.filter((lote) => lote.produto_id === produto.produto_id)
          setLotesDoProduto(lotesFiltrados)

          // Se estiver editando, tenta selecionar o lote atual
          if (editar && itemId) {
            const item = formData.itens.find((i) => i.id === itemId)
            if (item) {
              const loteAtual = lotesFiltrados.find((l) => l.lote_id === item.LOTEPROD_lote_id)
              if (loteAtual) {
                setLoteSelecionado(loteAtual)
              } else if (lotesFiltrados.length > 0) {
                setLoteSelecionado(lotesFiltrados[0])
              }
            }
          } else if (lotesFiltrados.length > 0) {
            // Para novo item, seleciona o primeiro lote
            setLoteSelecionado(lotesFiltrados[0])
            setCreateBatchMode(false) // Ensure we're in select mode
          }

          if (lotesFiltrados.length === 0) {
            // Automatically switch to batch creation mode if no batches are found
            setCreateBatchMode(true)
          }
        } else {
          // No batches available, switch to batch creation mode
          setLotesDoProduto([])
          setLoteSelecionado(null)
          setCreateBatchMode(true)
        }
      } catch (error) {
        console.error("Erro ao buscar lotes:", error)
        // Even if there's an error, allow the user to create a batch
        setLotesDoProduto([])
        setLoteSelecionado(null)
        setCreateBatchMode(true)
      } finally {
        setLoading(false)
      }

      // The modal will always be shown, regardless of whether there are batches or not
      setModalVisible(true)
      setShowProdutos(false)
    },
    [formData.JURIDICA_PESSOA_pessoa_id, formData.itens],
  )

  // Função para lidar com a entrada de data no formato DD/MM/YYYY
  const handleBatchValidadeInput = (text: string) => {
    setBatchValidadeInput(text)

    // Tentar converter a data digitada para um objeto Date
    if (text.length === 10) {
      // Formato completo DD/MM/YYYY
      const parts = text.split("/")
      if (parts.length === 3) {
        const day = Number.parseInt(parts[0], 10)
        const month = Number.parseInt(parts[1], 10) - 1 // Meses em JS são 0-11
        const year = Number.parseInt(parts[2], 10)

        const date = new Date(year, month, day)

        // Verificar se a data é válida
        if (!isNaN(date.getTime())) {
          setBatchFormData((prev) => ({
            ...prev,
            lote_validade: date,
          }))
        }
      }
    }
  }

  // Criar novo lote
  const criarNovoLote = async () => {
    if (!produtoSelecionado || !formData.JURIDICA_PESSOA_pessoa_id) {
      Alert.alert("Erro", "Produto ou fornecedor não selecionado.")
      return
    }

    // Validação básica
    if (!batchFormData.lote_codigo.trim()) {
      Alert.alert("Erro", "Código do lote é obrigatório.")
      return
    }

    if (!batchFormData.lote_validade) {
      Alert.alert("Erro", "Data de validade é obrigatória.")
      return
    }

    const qtdInicial = Number.parseFloat(batchFormData.lote_quantidade_inicial.replace(",", "."))
    if (isNaN(qtdInicial) || qtdInicial <= 0) {
      Alert.alert("Erro", "Quantidade inicial deve ser um número positivo.")
      return
    }

    const qtdAtual = Number.parseFloat(batchFormData.lote_quantidade_atual.replace(",", "."))
    if (isNaN(qtdAtual) || qtdAtual < 0) {
      Alert.alert("Erro", "Quantidade atual deve ser um número não negativo.")
      return
    }

    if (qtdAtual > qtdInicial) {
      Alert.alert("Erro", "Quantidade atual não pode ser maior que a inicial.")
      return
    }

    setLoading(true)
    try {
      // Preparar dados para envio
      const dadosLote = {
        produto_id: produtoSelecionado.produto_id,
        lote_codigo: batchFormData.lote_codigo,
        lote_validade: batchFormData.lote_validade ? batchFormData.lote_validade.toISOString() : null,
        lote_quantidade_inicial: Number.parseFloat(batchFormData.lote_quantidade_inicial.replace(",", ".")),
        lote_quantidade_atual: Number.parseFloat(batchFormData.lote_quantidade_atual.replace(",", ".")),
        data_entrada: new Date().toISOString(),
        ativo: true,
      }

      // Criar lote
      const resultado = await promocaoService.criarLote(dadosLote)

      if (resultado && resultado.lote_id) {
        // Buscar detalhes do lote criado
        const loteDetalhes = await promocaoService.buscarLotePorId(resultado.lote_id)

        // Criar objeto de lote para seleção
        const novoLote: LoteDisponivel = {
          lote_id: loteDetalhes.lote_id,
          lote_codigo: loteDetalhes.lote_codigo,
          produto_id: produtoSelecionado.produto_id,
          produto_nome: produtoSelecionado.produto_nome,
          lote_quantidade_atual: loteDetalhes.lote_quantidade_atual,
          lote_validade: loteDetalhes.lote_validade,
        }

        // Adicionar à lista de lotes e selecionar
        setLotesDoProduto([novoLote, ...lotesDoProduto])
        setLoteSelecionado(novoLote)
        setCreateBatchMode(false)

        Alert.alert("Sucesso", "Lote criado com sucesso!")
      } else {
        throw new Error("Falha ao criar lote.")
      }
    } catch (error) {
      console.error("Erro ao criar lote:", error)
      Alert.alert("Erro", "Ocorreu um erro ao criar o lote.")
    } finally {
      setLoading(false)
    }
  }

  // Confirmar data de validade do lote
  const confirmarDataLote = (date: Date) => {
    setShowBatchDatePicker(false)
    setBatchFormData((prev) => ({
      ...prev,
      lote_validade: date,
    }))
    setBatchValidadeInput(date.toLocaleDateString("pt-BR"))
  }

  // Adicionar ou editar item
  const adicionarOuEditarItem = () => {
    if (createBatchMode) {
      criarNovoLote()
      return
    }

    if (!produtoSelecionado || (!createBatchMode && !loteSelecionado)) {
      Alert.alert("Erro", "Selecione um produto e um lote.")
      return
    }

    // Validação básica
    if (!itemQuantidade.trim() || !itemValor.trim()) {
      Alert.alert("Erro", "Preencha a quantidade e o valor do produto.")
      return
    }

    // Validar quantidade como número positivo
    const qtd = Number.parseFloat(itemQuantidade.replace(",", "."))
    if (isNaN(qtd) || qtd <= 0) {
      Alert.alert("Erro", "A quantidade deve ser um número positivo.")
      return
    }

    // Validar valor como número positivo
    const valor = Number.parseFloat(itemValor.replace(",", "."))
    if (isNaN(valor) || valor <= 0) {
      Alert.alert("Erro", "O valor deve ser um número positivo.")
      return
    }

    // Validar estoque disponível
    if (!createBatchMode && loteSelecionado && qtd > loteSelecionado.lote_quantidade_atual) {
      Alert.alert("Erro", `Quantidade excede o estoque disponível (${loteSelecionado.lote_quantidade_atual}).`)
      return
    }

    // Só precisamos do loteDisplayNome se não estivermos no modo de criação de lote
    let loteDisplayNome = ""
    if (!createBatchMode && loteSelecionado) {
      loteDisplayNome = `${loteSelecionado.lote_codigo} (Val: ${
        loteSelecionado.lote_validade ? new Date(loteSelecionado.lote_validade).toLocaleDateString() : "N/A"
      })`
    }

    if (editingItemId) {
      // Editar item existente
      if (!loteSelecionado && createBatchMode) {
        Alert.alert("Erro", "Crie um lote primeiro antes de adicionar o produto.")
        return
      }

      setFormData((prev) => ({
        ...prev,
        itens: prev.itens.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                LOTEPROD_lote_id: loteSelecionado!.lote_id,
                itemPromocao_qtde: itemQuantidade,
                itemPromocao_valor: itemValor,
                lote_display_nome: loteDisplayNome,
                lote_estoque_disponivel: loteSelecionado!.lote_quantidade_atual,
              }
            : item,
        ),
      }))
    } else {
      // Verificar limite de produtos
      if (formData.itens.length >= MAX_PRODUTOS) {
        Alert.alert("Limite atingido", `Você já adicionou o máximo de ${MAX_PRODUTOS} produtos.`)
        setModalVisible(false)
        return
      }

      // Verificar se o produto já foi adicionado
      if (formData.itens.some((item) => item.produto_id === produtoSelecionado.produto_id)) {
        Alert.alert("Produto duplicado", "Este produto já foi adicionado à promoção.")
        return
      }

      // Verificar se temos um lote selecionado
      if (!loteSelecionado && !createBatchMode) {
        Alert.alert("Erro", "Selecione um lote para o produto.")
        return
      }

      // Se estamos no modo de criação de lote, precisamos criar o lote primeiro
      if (createBatchMode) {
        Alert.alert("Ação necessária", "Crie um lote primeiro antes de adicionar o produto.")
        return
      }

      // Adicionar novo item
      const novoItem: ItemPromocao = {
        id: generateTempId(),
        produto_id: produtoSelecionado.produto_id,
        produto_nome: produtoSelecionado.produto_nome,
        LOTEPROD_lote_id: loteSelecionado!.lote_id,
        itemPromocao_qtde: itemQuantidade,
        itemPromocao_valor: itemValor,
        produto_imagem_url: produtoSelecionado.produto_imagem_url,
        lote_display_nome: loteDisplayNome,
        lote_estoque_disponivel: loteSelecionado!.lote_quantidade_atual,
      }

      setFormData((prev) => ({
        ...prev,
        itens: [...prev.itens, novoItem],
      }))
    }

    setModalVisible(false)
    setProdutoQuery("")
  }

  // Remover item
  const removerItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      itens: prev.itens.filter((item) => item.id !== id),
    }))
  }

  // Formatar data para exibição
  const formatarData = (date: Date) => {
    return date.toLocaleDateString("pt-BR")
  }

  // Validar formulário
  const validarFormulario = (): boolean => {
    const erros: { [key: string]: string } = {}

    // Descrição é opcional conforme DTO do backend
    if (formData.promocao_descricao && formData.promocao_descricao.trim().length > 0 && formData.promocao_descricao.trim().length < 5) {
      erros.descricao = "Descrição deve ter pelo menos 5 caracteres"
    }

    if (!formData.JURIDICA_PESSOA_pessoa_id) {
      erros.fornecedor = "Selecione um fornecedor"
    }

    if (!formData.endereco_id) {
      erros.endereco = "Selecione um endereço"
    }

    if (formData.inicio > formData.fim) {
      erros.datas = "Data de início não pode ser posterior à data de fim"
    }

    if (formData.itens.length === 0) {
      erros.itens = "Adicione pelo menos um produto"
    }

    setErrors(erros)
    return Object.keys(erros).length === 0
  }

  // Preparar dados para envio
  const prepararDadosParaEnvio = () => {
    // Função para formatar data no formato esperado pelo backend: AAAA-MM-DD HH:MM:SS
    const formatarDataParaBackend = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Validar e formatar itens para o formato esperado pela API
    const itensFormatados = formData.itens
      .map((item) => {
        const qtd = Number.parseFloat(item.itemPromocao_qtde.replace(",", "."));
        const valor = Number.parseFloat(item.itemPromocao_valor.replace(",", "."));

        // Validar se os valores são números válidos
        if (isNaN(qtd) || isNaN(valor) || qtd <= 0 || valor <= 0) {
          console.error(`Item inválido: ${item.produto_nome}, qtd: ${qtd}, valor: ${valor}`);
          return null;
        }

        return {
          LOTEPROD_lote_id: item.LOTEPROD_lote_id,
          itemPromocao_qtde: qtd,
          itemPromocao_valor: valor,
        };
      })
      .filter((item) => item !== null); // Remover itens inválidos

    return {
      promocao_descricao: formData.promocao_descricao?.trim() || null,
      inicio: formatarDataParaBackend(formData.inicio),
      fim: formData.fim ? formatarDataParaBackend(formData.fim) : null,
      JURIDICA_PESSOA_pessoa_id: formData.JURIDICA_PESSOA_pessoa_id,
      endereco_id: formData.endereco_id,
      itens: itensFormatados,
    };
  }

  // Enviar formulário
  const enviarFormulario = async () => {
    // Usando a API Keyboard padrão do React Native
    Keyboard.dismiss()

    if (!validarFormulario()) {
      Alert.alert("Erro", "Corrija os erros no formulário antes de continuar.")
      return
    }

    setLoadingSubmit(true)
    try {
      const dadosParaEnvio = prepararDadosParaEnvio()

      // Validação adicional dos dados preparados
      if (!dadosParaEnvio.JURIDICA_PESSOA_pessoa_id) {
        throw new Error("Fornecedor não selecionado")
      }
      if (!dadosParaEnvio.endereco_id) {
        throw new Error("Endereço não selecionado")
      }
      if (dadosParaEnvio.itens.length === 0) {
        throw new Error("Nenhum item válido encontrado")
      }

      // Verificar se todos os itens têm dados válidos
      for (const item of dadosParaEnvio.itens) {
        if (!item.LOTEPROD_lote_id || typeof item.itemPromocao_qtde !== 'number' || typeof item.itemPromocao_valor !== 'number') {
          throw new Error("Dados de item inválidos")
        }
      }

      console.log("Dados para envio:", JSON.stringify(dadosParaEnvio, null, 2))

      let resultado
      if (isEditing && promocaoIdParaEditar) {
        resultado = await promocaoService.atualizarPromocao(promocaoIdParaEditar, dadosParaEnvio)
      } else {
        resultado = await promocaoService.criarPromocao(dadosParaEnvio)
      }

      Alert.alert("Sucesso", isEditing ? "Promoção atualizada com sucesso!" : "Promoção criada com sucesso!")

      // Navegar de volta
      navigation.goBack()
    } catch (error) {
      console.error("Erro ao salvar promoção:", error)
      const errorMessage = (error as any)?.response?.data?.message || (error as Error)?.message || "Ocorreu um erro ao salvar a promoção."
      Alert.alert("Erro", errorMessage)
    } finally {
      setLoadingSubmit(false)
    }
  }

  // Função para abrir o seletor de data nativo no web
  const handleOpenDatePicker = () => {
    if (Platform.OS === "web") {
      // No web, vamos focar no input de data
      if (dateInputRefValidade.current) {
        dateInputRefValidade.current.focus()
      }
    } else {
      // No mobile, usamos o DateTimePickerModal
      setShowBatchDatePicker(true)
    }
  }

  if (loading && isEditing && !modalVisible) {
    return <ActivityIndicator size="large" style={promotionFormStyles.centered} />
  }

  return (
    <ScrollView
      style={promotionFormStyles.container}
      contentContainerStyle={promotionFormStyles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={promotionFormStyles.title}>{isEditing ? "Editar Promoção" : "Nova Promoção"}</Text>

      {/* Descrição */}
      <View style={promotionFormStyles.formGroup}>
        <Text style={promotionFormStyles.label}>Descrição da Promoção (opcional):</Text>
        <TextInput
          style={[promotionFormStyles.input, errors.descricao ? promotionFormStyles.inputError : null]}
          value={formData.promocao_descricao}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, promocao_descricao: text }))}
          placeholder="Ex: Promoção de Verão (opcional)"
        />
        {errors.descricao ? <Text style={promotionFormStyles.errorText}>{errors.descricao}</Text> : null}
      </View>

      {/* Fornecedor */}
      <View style={promotionFormStyles.formGroup}>
        <Text style={promotionFormStyles.label}>Fornecedor:</Text>
        {fornecedorSelecionado ? (
          <View style={promotionFormStyles.selectedItem}>
            <Text style={promotionFormStyles.selectedItemText}>{fornecedorSelecionado.pessoa_nome}</Text>
            {!isEditing && (
              <TouchableOpacity onPress={removerFornecedor} style={promotionFormStyles.removeButton}>
                <Ionicons name="close-circle" size={24} color="#dc3545" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={promotionFormStyles.searchContainer}>
              <TextInput
                style={[promotionFormStyles.searchInput, errors.fornecedor ? promotionFormStyles.inputError : null]}
                value={fornecedorQuery}
                onChangeText={setFornecedorQuery}
                placeholder="Buscar fornecedor..."
                onSubmitEditing={() => buscarFornecedores(1, false)}
                editable={!loadingFornecedores && !isEditing}
              />
              <TouchableOpacity
                style={[promotionFormStyles.searchButton, (loadingFornecedores || isEditing) && promotionFormStyles.buttonDisabled]}
                onPress={() => buscarFornecedores(1, false)}
                disabled={loadingFornecedores || isEditing}
              >
                {loadingFornecedores && fornecedorPage === 1 ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={promotionFormStyles.searchButtonText}>Buscar</Text>
                )}
              </TouchableOpacity>
            </View>
            {errors.fornecedor ? <Text style={promotionFormStyles.errorText}>{errors.fornecedor}</Text> : null}
          </>
        )}

        {showFornecedores && !isEditing && (
          <View style={promotionFormStyles.resultsContainer}>
            <FlatList
              data={fornecedores}
              keyExtractor={(item) => item.pessoa_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={promotionFormStyles.resultItem} onPress={() => selecionarFornecedor(item)}>
                  <Text style={promotionFormStyles.resultItemText}>{item.pessoa_nome}</Text>
                  <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                </TouchableOpacity>
              )}
              ListFooterComponent={
                loadingFornecedores && fornecedorPage > 1 ? (
                  <ActivityIndicator style={promotionFormStyles.loadingMore} color="#007bff" />
                ) : null
              }
              onEndReached={() => {
                if (fornecedorPage < fornecedorTotalPages && !loadingFornecedores) {
                  buscarFornecedores(fornecedorPage + 1, true)
                }
              }}
              onEndReachedThreshold={0.5}
              style={promotionFormStyles.resultsList}
              nestedScrollEnabled={true}
            />
            {fornecedorTotal > 0 && (
              <Text style={promotionFormStyles.paginationInfo}>
                Exibindo {fornecedores.length} de {fornecedorTotal} fornecedores
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Endereço (Habilitado) */}
      <View style={promotionFormStyles.formGroup}>
        <Text style={promotionFormStyles.label}>Endereço:</Text>
        {loadingEnderecos ? (
          <View style={promotionFormStyles.loadingContainer}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text style={promotionFormStyles.loadingText}>Carregando endereços...</Text>
          </View>
        ) : formData.JURIDICA_PESSOA_pessoa_id ? (
          enderecos.length > 0 ? (
            <View style={promotionFormStyles.pickerContainer}>
              <Picker
                selectedValue={formData.endereco_id}
                onValueChange={(itemValue) => setFormData((prev) => ({ ...prev, endereco_id: itemValue }))}
                style={promotionFormStyles.picker}
                enabled={!isEditing}
              >
                <Picker.Item label="Selecione um endereço" value={undefined} />
                {enderecos.map((endereco) => (
                  <Picker.Item
                    key={endereco.endereco_id.toString()}
                    label={formatarEnderecoDisplay(endereco)}
                    value={endereco.endereco_id}
                  />
                ))}
              </Picker>
            </View>
          ) : (
            <View style={promotionFormStyles.disabledInput}>
              <Text style={promotionFormStyles.disabledText}>Nenhum endereço encontrado para este fornecedor</Text>
            </View>
          )
        ) : (
          <View style={promotionFormStyles.disabledInput}>
            <Text style={promotionFormStyles.disabledText}>Selecione um fornecedor primeiro</Text>
          </View>
        )}
        {errors.endereco ? <Text style={promotionFormStyles.errorText}>{errors.endereco}</Text> : null}
      </View>

      {/* Datas */}
      <View style={promotionFormStyles.formGroup}>
        <Text style={promotionFormStyles.label}>Período da Promoção:</Text>
        <View style={promotionFormStyles.dateContainer}>
          <DatePicker
            label="Início"
            value={formData.inicio}
            onChange={(date) => setFormData(prev => ({ ...prev, inicio: date || new Date() }))}
            minimumDate={new Date()}
          />

          <DatePicker
            label="Fim"
            value={formData.fim}
            onChange={(date) => setFormData(prev => ({ ...prev, fim: date || new Date() }))}
            minimumDate={formData.inicio}
          />
        </View>
        {errors.datas ? <Text style={promotionFormStyles.errorText}>{errors.datas}</Text> : null}
      </View>

      {/* Produtos */}
      <View style={promotionFormStyles.formGroup}>
        <Text style={promotionFormStyles.label}>Produtos em Promoção:</Text>
        {formData.JURIDICA_PESSOA_pessoa_id ? (
          <>
            <View style={promotionFormStyles.searchContainer}>
              <TextInput
                style={promotionFormStyles.searchInput}
                value={produtoQuery}
                onChangeText={setProdutoQuery}
                placeholder="Buscar produto..."
                onSubmitEditing={() => buscarProdutos(1, false)}
                editable={!!formData.JURIDICA_PESSOA_pessoa_id && !loadingProdutos}
              />
              <TouchableOpacity
                style={[
                  promotionFormStyles.searchButton,
                  (!formData.JURIDICA_PESSOA_pessoa_id || loadingProdutos) && promotionFormStyles.buttonDisabled,
                ]}
                onPress={() => buscarProdutos(1, false)}
                disabled={!formData.JURIDICA_PESSOA_pessoa_id || loadingProdutos}
              >
                {loadingProdutos && produtoPage === 1 ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={promotionFormStyles.searchButtonText}>Buscar</Text>
                )}
              </TouchableOpacity>
            </View>

            {showProdutos && (
              <View style={promotionFormStyles.resultsContainer}>
                <FlatList
                  data={produtos}
                  keyExtractor={(item) => item.produto_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={promotionFormStyles.resultItem} onPress={() => abrirModalProduto(item)}>
                      <View style={promotionFormStyles.produtoInfo}>
                        {item.produto_imagem_url && (
                          <Image source={{ uri: item.produto_imagem_url }} style={promotionFormStyles.produtoImagem} />
                        )}
                        <Text style={promotionFormStyles.resultItemText}>{item.produto_nome}</Text>
                      </View>
                      <Ionicons name="add-circle" size={24} color="#28a745" />
                    </TouchableOpacity>
                  )}
                  ListFooterComponent={
                    loadingProdutos && produtoPage > 1 ? (
                      <ActivityIndicator style={promotionFormStyles.loadingMore} color="#007bff" />
                    ) : null
                  }
                  onEndReached={() => {
                    if (produtoPage < produtoTotalPages && !loadingProdutos) {
                      buscarProdutos(produtoPage + 1, true)
                    }
                  }}
                  onEndReachedThreshold={0.5}
                  style={promotionFormStyles.resultsList}
                  nestedScrollEnabled={true}
                />
                {produtoTotal > 0 && (
                  <Text style={promotionFormStyles.paginationInfo}>
                    Exibindo {produtos.length} de {produtoTotal} produtos
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <Text style={promotionFormStyles.infoText}>Selecione um fornecedor para buscar produtos</Text>
        )}

        {/* Lista de itens adicionados */}
        {formData.itens.length > 0 ? (
          <View style={promotionFormStyles.itensList}>
            <Text style={promotionFormStyles.subLabel}>
              Itens adicionados ({formData.itens.length}/{MAX_PRODUTOS}):
            </Text>
            {formData.itens.map((item) => (
              <View key={item.id} style={promotionFormStyles.itemCard}>
                <View style={promotionFormStyles.itemHeader}>
                  <Text style={promotionFormStyles.itemTitle}>{item.produto_nome}</Text>
                  <View style={promotionFormStyles.itemActions}>
                    <TouchableOpacity
                      style={promotionFormStyles.itemAction}
                      onPress={() => {
                        const produto = {
                          produto_id: item.produto_id,
                          produto_nome: item.produto_nome,
                          produto_imagem_url: item.produto_imagem_url,
                        }
                        abrirModalProduto(produto, true, item.id)
                      }}
                      disabled={loadingSubmit}
                    >
                      <Ionicons name="pencil-outline" size={20} color="#007bff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={promotionFormStyles.itemAction}
                      onPress={() => removerItem(item.id)}
                      disabled={loadingSubmit}
                    >
                      <Ionicons name="trash-outline" size={20} color="#dc3545" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={promotionFormStyles.itemDetails}>
                  {item.lote_display_nome && <Text style={promotionFormStyles.itemDetail}>Lote: {item.lote_display_nome}</Text>}
                  <Text style={promotionFormStyles.itemDetail}>Quantidade: {item.itemPromocao_qtde}</Text>
                  <Text style={promotionFormStyles.itemDetail}>Valor promocional: R$ {item.itemPromocao_valor}</Text>
                  {item.lote_estoque_disponivel !== undefined && (
                    <Text style={promotionFormStyles.itemDetailSmall}>Estoque disponível: {item.lote_estoque_disponivel}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          formData.JURIDICA_PESSOA_pessoa_id && (
            <Text style={promotionFormStyles.infoText}>Nenhum produto adicionado à promoção</Text>
          )
        )}
        {errors.itens ? <Text style={promotionFormStyles.errorText}>{errors.itens}</Text> : null}
      </View>

      {/* Botão Cancelar */}
      <TouchableOpacity
        style={[promotionFormStyles.cancelButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={promotionFormStyles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>

      {/* Botão Salvar */}
      <TouchableOpacity
        style={[promotionFormStyles.submitButton, (loadingSubmit || loading) && promotionFormStyles.buttonDisabled]}
        onPress={enviarFormulario}
        disabled={loadingSubmit || loading}
      >
        {loadingSubmit ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={promotionFormStyles.submitButtonText}>{isEditing ? "Atualizar Promoção" : "Salvar Promoção"}</Text>
        )}
      </TouchableOpacity>

      {/* Modal para adicionar/editar produto */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={promotionFormStyles.modalOverlay}>
          <View style={promotionFormStyles.modalContent}>
            <Text style={promotionFormStyles.modalTitle}>{editingItemId ? "Editar Produto" : "Adicionar Produto"}</Text>

            {produtoSelecionado && (
              <View style={promotionFormStyles.modalProdutoInfo}>
                {produtoSelecionado.produto_imagem_url && (
                  <Image source={{ uri: produtoSelecionado.produto_imagem_url }} style={promotionFormStyles.modalProdutoImagem} />
                )}
                <Text style={promotionFormStyles.modalProdutoNome}>{produtoSelecionado.produto_nome}</Text>
              </View>
            )}

            {/* Add batch mode toggle */}
            <View style={promotionFormStyles.batchModeToggle}>
              <TouchableOpacity
                style={[promotionFormStyles.batchModeButton, !createBatchMode && promotionFormStyles.batchModeButtonActive]}
                onPress={() => setCreateBatchMode(false)}
              >
                <Text style={[promotionFormStyles.batchModeButtonText, !createBatchMode && promotionFormStyles.batchModeButtonTextActive]}>
                  Selecionar Lote
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[promotionFormStyles.batchModeButton, createBatchMode && promotionFormStyles.batchModeButtonActive]}
                onPress={() => setCreateBatchMode(true)}
              >
                <Text style={[promotionFormStyles.batchModeButtonText, createBatchMode && promotionFormStyles.batchModeButtonTextActive]}>
                  Criar Lote
                </Text>
              </TouchableOpacity>
            </View>

            {!createBatchMode ? (
              // Existing lote selection UI - only show if there are batches
              lotesDoProduto.length > 0 ? (
                <View style={promotionFormStyles.modalForm}>
                  <Text style={promotionFormStyles.modalLabel}>Lote:</Text>
                  <View style={promotionFormStyles.loteSelector}>
                    <FlatList
                      data={lotesDoProduto}
                      keyExtractor={(item) => item.lote_id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[promotionFormStyles.loteItem, loteSelecionado?.lote_id === item.lote_id && promotionFormStyles.loteSelecionado]}
                          onPress={() => setLoteSelecionado(item)}
                        >
                          <Text style={promotionFormStyles.loteItemText}>
                            {item.lote_codigo} - Estoque: {item.lote_quantidade_atual}
                            {item.lote_validade && ` - Val: ${new Date(item.lote_validade).toLocaleDateString()}`}
                          </Text>
                        </TouchableOpacity>
                      )}
                      style={promotionFormStyles.loteList}
                      nestedScrollEnabled={true}
                    />
                  </View>

                  <Text style={promotionFormStyles.modalLabel}>Quantidade:</Text>
                  <TextInput
                    style={promotionFormStyles.modalInput}
                    value={itemQuantidade}
                    onChangeText={setItemQuantidade}
                    keyboardType="numeric"
                    placeholder="Quantidade"
                  />

                  <Text style={promotionFormStyles.modalLabel}>Valor Promocional (R$):</Text>
                  <TextInput
                    style={promotionFormStyles.modalInput}
                    value={itemValor}
                    onChangeText={setItemValor}
                    keyboardType="numeric"
                    placeholder="Valor"
                  />
                </View>
              ) : (
                // No batches available - show a message and automatically switch to create mode
                <View style={promotionFormStyles.modalForm}>
                  <Text style={promotionFormStyles.infoText}>Não há lotes disponíveis para este produto.</Text>
                  <TouchableOpacity style={promotionFormStyles.createBatchButton} onPress={() => setCreateBatchMode(true)}>
                    <Text style={promotionFormStyles.createBatchButtonText}>Criar um novo lote</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              // Batch creation form - no changes here
              <View style={promotionFormStyles.modalForm}>
                {/* Existing batch creation form */}
                <Text style={promotionFormStyles.modalLabel}>Código do Lote:</Text>
                <TextInput
                  style={promotionFormStyles.modalInput}
                  value={batchFormData.lote_codigo}
                  onChangeText={(text) => setBatchFormData((prev) => ({ ...prev, lote_codigo: text }))}
                  placeholder="LOT-2025-000"
                  placeholderTextColor="rgba(0,0,0,0.3)"
                />

                <Text style={promotionFormStyles.modalLabel}>Data de Validade:</Text>
                {Platform.OS === "web" ? (
                  // Para web, usamos um input de texto com máscara DD/MM/YYYY
                  <TextInput
                    ref={dateInputRefValidade}
                    style={promotionFormStyles.modalInput}
                    value={batchValidadeInput}
                    onChangeText={handleBatchValidadeInput}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                ) : (
                  // Para mobile, mantemos o TouchableOpacity que abre o DateTimePickerModal
                  <TouchableOpacity style={promotionFormStyles.dateInput} onPress={() => setShowBatchDatePicker(true)}>
                    <Text>
                      {batchFormData.lote_validade
                        ? batchFormData.lote_validade.toLocaleDateString("pt-BR")
                        : "Selecione a data de validade"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#555" />
                  </TouchableOpacity>
                )}

                <Text style={promotionFormStyles.modalLabel}>Quantidade Inicial:</Text>
                <TextInput
                  style={promotionFormStyles.modalInput}
                  value={batchFormData.lote_quantidade_inicial}
                  onChangeText={(text) => setBatchFormData((prev) => ({ ...prev, lote_quantidade_inicial: text }))}
                  keyboardType="numeric"
                  placeholder="Ex: 100"
                />

                <Text style={promotionFormStyles.modalLabel}>Quantidade Atual:</Text>
                <TextInput
                  style={promotionFormStyles.modalInput}
                  value={batchFormData.lote_quantidade_atual}
                  onChangeText={(text) => setBatchFormData((prev) => ({ ...prev, lote_quantidade_atual: text }))}
                  keyboardType="numeric"
                  placeholder="Ex: 100"
                />

                {createBatchMode && (
                  <>
                    <Text style={promotionFormStyles.modalLabel}>Quantidade para Promoção:</Text>
                    <TextInput
                      style={promotionFormStyles.modalInput}
                      value={itemQuantidade}
                      onChangeText={setItemQuantidade}
                      keyboardType="numeric"
                      placeholder="Quantidade"
                    />

                    <Text style={promotionFormStyles.modalLabel}>Valor Promocional (R$):</Text>
                    <TextInput
                      style={promotionFormStyles.modalInput}
                      value={itemValor}
                      onChangeText={setItemValor}
                      keyboardType="numeric"
                      placeholder="Valor"
                    />
                  </>
                )}
              </View>
            )}

            <View style={promotionFormStyles.modalButtons}>
              <TouchableOpacity
                style={[promotionFormStyles.modalButton, promotionFormStyles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={promotionFormStyles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[promotionFormStyles.modalButton, promotionFormStyles.modalConfirmButton]}
                onPress={adicionarOuEditarItem}
                disabled={!createBatchMode && !loteSelecionado}
              >
                <Text style={promotionFormStyles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


    </ScrollView>
  )
}

export default PromotionFormScreen
