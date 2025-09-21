import { useState, useCallback, useEffect } from "react"
import { Keyboard, Platform, useWindowDimensions } from "react-native"
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import promocaoService from "../../../services/promocaoService"
import categoriaService from "../../../services/categoriaService"
import PromocaoCard from "../../../components/Promotions/PromocaoCard"
import { homeStyles } from "../../../common/styles/Core/homeScreenLegacy.styled"
import { CategoriaItem, Promocao } from "./homeScreen.constants"
import { useSearch } from "../../../contexts/SearchHomeContext/searchHomeContext"

const InicioScreen = () => {
  const navigation = useNavigation<any>()
  const { width } = useWindowDimensions()
  const [numColumns, setNumColumns] = useState(1)
  const [cardWidth, setCardWidth] = useState(0)

  const { searchQuery, debouncedQuery, searchType, setSearchType, setPerformSearch, selectedCategoriaId, setSelectedCategoriaId, categoriasFiltro, setCategoriasFiltro } = useSearch()
  const [promocoes, setPromocoes] = useState<Promocao[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Atualiza o número de colunas e a largura dos cards com base na largura da tela
  useEffect(() => {
    const updateLayout = () => {
      let columns = 1

      // Ajuste do número de colunas com base na largura da tela
      if (width < 768) {
        columns = 2 // Todas as telas móveis terão 2 colunas
      } else if (width < 1024) {
        columns = 3 // Tablets e desktops pequenos
      } else {
        columns = 4 // Desktops maiores
      }

      setNumColumns(columns)

      // Calcula a largura do card com base no número de colunas
      const containerPadding = 32 // 16px de cada lado
      const gapBetweenCards = 12 * (columns - 1) // Espaço entre os cards
      const availableWidth = width - containerPadding - gapBetweenCards

      // Se for web e a tela for grande, limita a largura máxima do container
      const maxContainerWidth = 1200
      const containerWidth =
        Platform.OS === "web" && width > 768
          ? Math.min(availableWidth, maxContainerWidth - containerPadding)
          : availableWidth

      const calculatedCardWidth = containerWidth / columns
      setCardWidth(calculatedCardWidth)
    }

    updateLayout()
  }, [width])

  // --- Buscar Dados ---
  const fetchPromocoes = useCallback(
    async (isRefreshing = false) => {
      if (!isRefreshing) setLoading(true)
      setError(null)
      try {
        const params: any = {}
        if (debouncedQuery.trim()) {
          params.searchTerm = debouncedQuery.trim()
          params.searchType = searchType
        }
        // Só adiciona o parâmetro categoriaId se um valor válido estiver selecionado
        if (selectedCategoriaId && selectedCategoriaId > 0) {
          params.categoriaId = selectedCategoriaId
        }
        console.log("[InicioScreen] Buscando promoções com params:", params)
        const data = await promocaoService.listarPromocoes(params)
        setPromocoes(data || [])
      } catch (err) {
        console.error("Erro ao buscar promoções:", err)
        setError("Não foi possível carregar as promoções.")
        setPromocoes([])
      } finally {
        if (!isRefreshing) setLoading(false)
      }
    },
    [debouncedQuery, searchType, selectedCategoriaId],
  )

  const fetchCategoriasParaFiltro = async () => {
    try {
      const data = await categoriaService.listarCategorias()
      setCategoriasFiltro(data || [])
    } catch (error) {
      console.error("Erro ao buscar categorias para filtro:", error)
      // Pode mostrar um alerta ou tratar silenciosamente
    }
  }

  // Busca inicial e ao focar
  useFocusEffect(
    useCallback(() => {
      fetchPromocoes()
      if (categoriasFiltro.length === 0) {
        fetchCategoriasParaFiltro()
      }
    }, []), // Executa apenas na primeira vez que foca, ou se dependências mudarem
  )

  // Buscar quando debouncedQuery muda
  useEffect(() => {
    fetchPromocoes()
  }, [debouncedQuery, searchType, selectedCategoriaId])

  // Setar performSearch
  useEffect(() => {
    setPerformSearch(() => fetchPromocoes)
  }, [fetchPromocoes])

  const openPromotionDetails = (promocaoId: number) => {
    navigation.navigate("PromocaoDetail", { promocaoId: promocaoId })
  }

  // --- Renderização ---
  const renderHeader = () => (
    <View style={homeStyles.headerContainer}>
      {/* Filtro movido para o header global */}
    </View>
  )

  // Função para renderizar os itens em grid responsivo
  const renderItem = ({ item }: { item: Promocao }) => {
    return (
      <View style={[homeStyles.cardWrapper, { width: cardWidth }]}>
        <PromocaoCard {...item} onPressDetalhes={() => openPromotionDetails(item.promocao_id)} />
      </View>
    )
  }

  if (loading && promocoes.length === 0)
    return <ActivityIndicator size="large" color="#007bff" style={homeStyles.centered} />
  if (error)
    return (
      <View style={homeStyles.centered}>
        <Text style={homeStyles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => fetchPromocoes()}>
          <Text style={homeStyles.retryText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    )

  // Certifique-se de que o FlatList esteja configurado corretamente
  return (
    <View style={homeStyles.container}>
      <FlatList
        data={promocoes}
        keyExtractor={(item) => item.promocao_id.toString()}
        renderItem={renderItem}
        numColumns={numColumns}
        key={`grid-${numColumns}`} // Força recriação do FlatList quando o número de colunas muda
        ListHeaderComponent={renderHeader} // Barra de busca e filtro no topo
        ListEmptyComponent={<Text style={homeStyles.emptyText}>Nenhuma promoção encontrada com os filtros atuais.</Text>}
        contentContainerStyle={[
          homeStyles.listContent,
          // Se for desktop, centraliza o conteúdo e limita a largura máxima
          Platform.OS === "web" &&
            width > 768 && {
              maxWidth: 1200,
              alignSelf: "center",
              width: "100%",
            },
        ]}
        columnWrapperStyle={numColumns > 1 ? homeStyles.columnWrapper : undefined}
        onRefresh={fetchPromocoes.bind(null, true)} // Passa true para isRefreshing
        refreshing={loading && promocoes.length > 0} // Mostra indicador de refresh se carregando E já tem itens
      />

    </View>
  )
}

export default InicioScreen
