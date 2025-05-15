"use client"

import { useState, useCallback, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  Image,
  Keyboard, // Importação correta do Keyboard
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
// Removida a importação direta do Keyboard que causava o erro
// import Keyboard from "react-native/Libraries/Components/Keyboard/Keyboard"
import promocaoService from "../../services/promocaoService"

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

const PromocaoFormScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const promocaoIdParaEditar = route.params?.promocaoId
  const isEditing = !!promocaoIdParaEditar

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

            if (fornecedorAtual && !fornecedorAtual.pessoa_nome && promoDetalhes.JURIDICA_PESSOA_pessoa_id) {
              try {
                const result = await promocaoService.listarFornecedoresAtivos({
                  pessoaId: promoDetalhes.JURIDICA_PESSOA_pessoa_id,
                })
                if (result && result.data && result.data.length > 0) {
                  fornecedorAtual.pessoa_nome = result.data[0].pessoa_nome
                }
              } catch (e) {
                console.error("Erro ao buscar nome do fornecedor na edição", e)
              }
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
              itens: (promoDetalhes.itens || []).map((item: any) => ({
                id: generateTempId(),
                produto_id: item.produto?.produto_id,
                produto_nome: item.produto?.produto_nome || "Produto Desconhecido",
                produto_imagem_url: item.produto?.produto_imagem_url,
                LOTEPROD_lote_id: item.LOTEPROD_lote_id || item.lote?.lote_id,
                itemPromocao_qtde: item.itemPromocao_qtde?.toString() || "",
                itemPromocao_valor: item.itemPromocao_valor?.toString().replace(".", ",") || "",
                lote_display_nome: `${item.lote?.lote_codigo} (Val: ${item.lote?.lote_validade ? new Date(item.lote.lote_validade).toLocaleDateString() : "N/A"})`,
                lote_estoque_disponivel: item.lote?.lote_quantidade_atual,
              })),
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
          }

          if (lotesFiltrados.length === 0) {
            Alert.alert("Atenção", "Não há lotes disponíveis para este produto.")
            setLoading(false)
            return
          }
        } else {
          Alert.alert("Atenção", "Não há lotes disponíveis para este produto.")
          setLoading(false)
          return
        }
      } catch (error) {
        console.error("Erro ao buscar lotes:", error)
        Alert.alert("Erro", "Não foi possível carregar lotes do produto.")
        setLoading(false)
        return
      } finally {
        setLoading(false)
      }

      setModalVisible(true)
      setShowProdutos(false)
    },
    [formData.JURIDICA_PESSOA_pessoa_id, formData.itens],
  )

  // Adicionar ou editar item
  const adicionarOuEditarItem = () => {
    if (!produtoSelecionado || !loteSelecionado) {
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
    if (qtd > loteSelecionado.lote_quantidade_atual) {
      Alert.alert("Erro", `Quantidade excede o estoque disponível (${loteSelecionado.lote_quantidade_atual}).`)
      return
    }

    const loteDisplayNome = `${loteSelecionado.lote_codigo} (Val: ${
      loteSelecionado.lote_validade ? new Date(loteSelecionado.lote_validade).toLocaleDateString() : "N/A"
    })`

    if (editingItemId) {
      // Editar item existente
      setFormData((prev) => ({
        ...prev,
        itens: prev.itens.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                LOTEPROD_lote_id: loteSelecionado.lote_id,
                itemPromocao_qtde: itemQuantidade,
                itemPromocao_valor: itemValor,
                lote_display_nome: loteDisplayNome,
                lote_estoque_disponivel: loteSelecionado.lote_quantidade_atual,
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

      // Adicionar novo item
      const novoItem: ItemPromocao = {
        id: generateTempId(),
        produto_id: produtoSelecionado.produto_id,
        produto_nome: produtoSelecionado.produto_nome,
        LOTEPROD_lote_id: loteSelecionado.lote_id,
        itemPromocao_qtde: itemQuantidade,
        itemPromocao_valor: itemValor,
        produto_imagem_url: produtoSelecionado.produto_imagem_url,
        lote_display_nome: loteDisplayNome,
        lote_estoque_disponivel: loteSelecionado.lote_quantidade_atual,
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

  // Mostrar seletor de data
  const mostrarDatePicker = (mode: "inicio" | "fim") => {
    setDatePickerMode(mode)
    setShowDatePicker(true)
  }

  // Confirmar data selecionada
  const confirmarData = (date: Date) => {
    setShowDatePicker(false)

    if (datePickerMode === "inicio") {
      setFormData((prev) => ({
        ...prev,
        inicio: date,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        fim: date,
      }))
    }
  }

  // Validar formulário
  const validarFormulario = (): boolean => {
    const erros: { [key: string]: string } = {}

    if (!formData.promocao_descricao.trim()) {
      erros.descricao = "Descrição é obrigatória"
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
    // Formatar itens para o formato esperado pela API
    const itensFormatados = formData.itens.map((item) => ({
      LOTEPROD_lote_id: item.LOTEPROD_lote_id,
      itemPromocao_qtde: Number.parseFloat(item.itemPromocao_qtde.replace(",", ".")),
      itemPromocao_valor: Number.parseFloat(item.itemPromocao_valor.replace(",", ".")),
    }))

    return {
      promocao_descricao: formData.promocao_descricao,
      inicio: formData.inicio.toISOString(),
      fim: formData.fim.toISOString(),
      JURIDICA_PESSOA_pessoa_id: formData.JURIDICA_PESSOA_pessoa_id,
      endereco_id: formData.endereco_id,
      itens: itensFormatados,
    }
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
      Alert.alert("Erro", "Ocorreu um erro ao salvar a promoção.")
    } finally {
      setLoadingSubmit(false)
    }
  }

  if (loading && isEditing && !modalVisible) {
    return <ActivityIndicator size="large" style={styles.centered} />
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{isEditing ? "Editar Promoção" : "Nova Promoção"}</Text>

      {/* Descrição */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Descrição da Promoção:</Text>
        <TextInput
          style={[styles.input, errors.descricao ? styles.inputError : null]}
          value={formData.promocao_descricao}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, promocao_descricao: text }))}
          placeholder="Ex: Promoção de Verão"
        />
        {errors.descricao ? <Text style={styles.errorText}>{errors.descricao}</Text> : null}
      </View>

      {/* Fornecedor */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Fornecedor:</Text>
        {fornecedorSelecionado ? (
          <View style={styles.selectedItem}>
            <Text style={styles.selectedItemText}>{fornecedorSelecionado.pessoa_nome}</Text>
            {!isEditing && (
              <TouchableOpacity onPress={removerFornecedor} style={styles.removeButton}>
                <Ionicons name="close-circle" size={24} color="#dc3545" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, errors.fornecedor ? styles.inputError : null]}
                value={fornecedorQuery}
                onChangeText={setFornecedorQuery}
                placeholder="Buscar fornecedor..."
                onSubmitEditing={() => buscarFornecedores(1, false)}
                editable={!loadingFornecedores && !isEditing}
              />
              <TouchableOpacity
                style={[styles.searchButton, (loadingFornecedores || isEditing) && styles.buttonDisabled]}
                onPress={() => buscarFornecedores(1, false)}
                disabled={loadingFornecedores || isEditing}
              >
                {loadingFornecedores && fornecedorPage === 1 ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.searchButtonText}>Buscar</Text>
                )}
              </TouchableOpacity>
            </View>
            {errors.fornecedor ? <Text style={styles.errorText}>{errors.fornecedor}</Text> : null}
          </>
        )}

        {showFornecedores && !isEditing && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={fornecedores}
              keyExtractor={(item) => item.pessoa_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultItem} onPress={() => selecionarFornecedor(item)}>
                  <Text style={styles.resultItemText}>{item.pessoa_nome}</Text>
                  <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                </TouchableOpacity>
              )}
              ListFooterComponent={
                loadingFornecedores && fornecedorPage > 1 ? (
                  <ActivityIndicator style={styles.loadingMore} color="#007bff" />
                ) : null
              }
              onEndReached={() => {
                if (fornecedorPage < fornecedorTotalPages && !loadingFornecedores) {
                  buscarFornecedores(fornecedorPage + 1, true)
                }
              }}
              onEndReachedThreshold={0.5}
              style={styles.resultsList}
              nestedScrollEnabled={true}
            />
            {fornecedorTotal > 0 && (
              <Text style={styles.paginationInfo}>
                Exibindo {fornecedores.length} de {fornecedorTotal} fornecedores
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Endereço (Habilitado) */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Endereço:</Text>
        {loadingEnderecos ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text style={styles.loadingText}>Carregando endereços...</Text>
          </View>
        ) : formData.JURIDICA_PESSOA_pessoa_id ? (
          enderecos.length > 0 ? (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.endereco_id}
                onValueChange={(itemValue) => setFormData((prev) => ({ ...prev, endereco_id: itemValue }))}
                style={styles.picker}
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
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>Nenhum endereço encontrado para este fornecedor</Text>
            </View>
          )
        ) : (
          <View style={styles.disabledInput}>
            <Text style={styles.disabledText}>Selecione um fornecedor primeiro</Text>
          </View>
        )}
        {errors.endereco ? <Text style={styles.errorText}>{errors.endereco}</Text> : null}
      </View>

      {/* Datas */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Período da Promoção:</Text>
        <View style={styles.dateContainer}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Início:</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => mostrarDatePicker("inicio")}>
              <Text>{formatarData(formData.inicio)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Fim:</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => mostrarDatePicker("fim")}>
              <Text>{formatarData(formData.fim)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
        {errors.datas ? <Text style={styles.errorText}>{errors.datas}</Text> : null}
      </View>

      {/* Produtos */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Produtos em Promoção:</Text>
        {formData.JURIDICA_PESSOA_pessoa_id ? (
          <>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={produtoQuery}
                onChangeText={setProdutoQuery}
                placeholder="Buscar produto..."
                onSubmitEditing={() => buscarProdutos(1, false)}
                editable={!!formData.JURIDICA_PESSOA_pessoa_id && !loadingProdutos}
              />
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  (!formData.JURIDICA_PESSOA_pessoa_id || loadingProdutos) && styles.buttonDisabled,
                ]}
                onPress={() => buscarProdutos(1, false)}
                disabled={!formData.JURIDICA_PESSOA_pessoa_id || loadingProdutos}
              >
                {loadingProdutos && produtoPage === 1 ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.searchButtonText}>Buscar</Text>
                )}
              </TouchableOpacity>
            </View>

            {showProdutos && (
              <View style={styles.resultsContainer}>
                <FlatList
                  data={produtos}
                  keyExtractor={(item) => item.produto_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.resultItem} onPress={() => abrirModalProduto(item)}>
                      <View style={styles.produtoInfo}>
                        {item.produto_imagem_url && (
                          <Image source={{ uri: item.produto_imagem_url }} style={styles.produtoImagem} />
                        )}
                        <Text style={styles.resultItemText}>{item.produto_nome}</Text>
                      </View>
                      <Ionicons name="add-circle" size={24} color="#28a745" />
                    </TouchableOpacity>
                  )}
                  ListFooterComponent={
                    loadingProdutos && produtoPage > 1 ? (
                      <ActivityIndicator style={styles.loadingMore} color="#007bff" />
                    ) : null
                  }
                  onEndReached={() => {
                    if (produtoPage < produtoTotalPages && !loadingProdutos) {
                      buscarProdutos(produtoPage + 1, true)
                    }
                  }}
                  onEndReachedThreshold={0.5}
                  style={styles.resultsList}
                  nestedScrollEnabled={true}
                />
                {produtoTotal > 0 && (
                  <Text style={styles.paginationInfo}>
                    Exibindo {produtos.length} de {produtoTotal} produtos
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.infoText}>Selecione um fornecedor para buscar produtos</Text>
        )}

        {/* Lista de itens adicionados */}
        {formData.itens.length > 0 ? (
          <View style={styles.itensList}>
            <Text style={styles.subLabel}>
              Itens adicionados ({formData.itens.length}/{MAX_PRODUTOS}):
            </Text>
            {formData.itens.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.produto_nome}</Text>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.itemAction}
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
                      style={styles.itemAction}
                      onPress={() => removerItem(item.id)}
                      disabled={loadingSubmit}
                    >
                      <Ionicons name="trash-outline" size={20} color="#dc3545" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.itemDetails}>
                  {item.lote_display_nome && <Text style={styles.itemDetail}>Lote: {item.lote_display_nome}</Text>}
                  <Text style={styles.itemDetail}>Quantidade: {item.itemPromocao_qtde}</Text>
                  <Text style={styles.itemDetail}>Valor promocional: R$ {item.itemPromocao_valor}</Text>
                  {item.lote_estoque_disponivel !== undefined && (
                    <Text style={styles.itemDetailSmall}>Estoque disponível: {item.lote_estoque_disponivel}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          formData.JURIDICA_PESSOA_pessoa_id && (
            <Text style={styles.infoText}>Nenhum produto adicionado à promoção</Text>
          )
        )}
        {errors.itens ? <Text style={styles.errorText}>{errors.itens}</Text> : null}
      </View>

      {/* Botão Salvar */}
      <TouchableOpacity
        style={[styles.submitButton, (loadingSubmit || loading) && styles.buttonDisabled]}
        onPress={enviarFormulario}
        disabled={loadingSubmit || loading}
      >
        {loadingSubmit ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{isEditing ? "Atualizar Promoção" : "Salvar Promoção"}</Text>
        )}
      </TouchableOpacity>

      {/* Modal para adicionar/editar produto */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingItemId ? "Editar Produto" : "Adicionar Produto"}</Text>

            {produtoSelecionado && (
              <View style={styles.modalProdutoInfo}>
                {produtoSelecionado.produto_imagem_url && (
                  <Image source={{ uri: produtoSelecionado.produto_imagem_url }} style={styles.modalProdutoImagem} />
                )}
                <Text style={styles.modalProdutoNome}>{produtoSelecionado.produto_nome}</Text>
              </View>
            )}

            {lotesDoProduto.length > 0 && (
              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Lote:</Text>
                <View style={styles.loteSelector}>
                  <FlatList
                    data={lotesDoProduto}
                    keyExtractor={(item) => item.lote_id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.loteItem, loteSelecionado?.lote_id === item.lote_id && styles.loteSelecionado]}
                        onPress={() => setLoteSelecionado(item)}
                      >
                        <Text style={styles.loteItemText}>
                          {item.lote_codigo} - Estoque: {item.lote_quantidade_atual}
                          {item.lote_validade && ` - Val: ${new Date(item.lote_validade).toLocaleDateString()}`}
                        </Text>
                      </TouchableOpacity>
                    )}
                    style={styles.loteList}
                    nestedScrollEnabled={true}
                  />
                </View>

                <Text style={styles.modalLabel}>Quantidade:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={itemQuantidade}
                  onChangeText={setItemQuantidade}
                  keyboardType="numeric"
                  placeholder="Quantidade"
                />

                <Text style={styles.modalLabel}>Valor Promocional (R$):</Text>
                <TextInput
                  style={styles.modalInput}
                  value={itemValor}
                  onChangeText={setItemValor}
                  keyboardType="numeric"
                  placeholder="Valor"
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={adicionarOuEditarItem}
                disabled={!loteSelecionado}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={confirmarData}
        onCancel={() => setShowDatePicker(false)}
        date={datePickerMode === "inicio" ? formData.inicio : formData.fim}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#212529",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#495057",
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#6c757d",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#e9ecef",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
  },
  disabledText: {
    color: "#6c757d",
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  picker: {
    height: 50,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
  },
  loadingText: {
    marginLeft: 10,
    color: "#6c757d",
    fontSize: 14,
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
  },
  infoText: {
    color: "#6c757d",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
    justifyContent: "center",
    minWidth: 80,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },
  resultsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  resultItemText: {
    fontSize: 14,
    color: "#212529",
  },
  produtoInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  produtoImagem: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
  },
  loadingMore: {
    padding: 8,
  },
  paginationInfo: {
    textAlign: "center",
    fontSize: 12,
    color: "#6c757d",
    padding: 4,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  selectedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e9f7ef",
    borderColor: "#d1e7dd",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
  },
  selectedItemText: {
    fontSize: 16,
    color: "#0f5132",
  },
  removeButton: {
    padding: 4,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateField: {
    width: "48%",
  },
  dateLabel: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 4,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
  },
  itensList: {
    marginTop: 16,
  },
  itemCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#212529",
    flex: 1,
  },
  itemActions: {
    flexDirection: "row",
  },
  itemAction: {
    padding: 4,
    marginLeft: 8,
  },
  itemDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f8f9fa",
    paddingTop: 8,
  },
  itemDetail: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 4,
  },
  itemDetailSmall: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#212529",
  },
  modalProdutoInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalProdutoImagem: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginBottom: 8,
  },
  modalProdutoNome: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  modalForm: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#495057",
  },
  modalInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  loteSelector: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
  },
  loteList: {
    maxHeight: 120,
  },
  loteItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  loteSelecionado: {
    backgroundColor: "#e9f7ef",
  },
  loteItemText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#6c757d",
    marginRight: 8,
  },
  modalConfirmButton: {
    backgroundColor: "#28a745",
    marginLeft: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default PromocaoFormScreen
