import { useState, useCallback, useEffect } from "react"
import { Keyboard, Platform, useWindowDimensions } from "react-native"
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import promocaoService from "../../services/promocaoService"
import categoriaService from "../../services/categoriaService" // Para o filtro de categorias
import PromocaoCard from "../../components/Promotions/PromocaoCard" // Importa o Card
import { homeStyles } from "../../common/styles/Core/homeScreen.styled"

// Tipos (ajuste conforme necessário)
interface Promocao {
  promocao_id: number
  promocao_descricao?: string
  fornecedor: { pessoa_id: number; pessoa_nome: string }
  itens_preview: Array<{ produto_id: number; produto_nome: string; itemPromocao_valor: number; imagem_url?: string }>
}
interface CategoriaItem {
  categoria_id: number
  categoria_nome: string
}

const InicioScreen = () => {
  const navigation = useNavigation<any>() // Tipar se tiver param list
  const { width } = useWindowDimensions() // Obtém a largura da tela
  const [numColumns, setNumColumns] = useState(1)
  const [cardWidth, setCardWidth] = useState(0)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"produto" | "fornecedor">("produto") // Default
  const [promocoes, setPromocoes] = useState<Promocao[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [categoriasFiltro, setCategoriasFiltro] = useState<CategoriaItem[]>([])
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | undefined>(undefined)

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
        if (searchQuery.trim()) {
          params.searchTerm = searchQuery.trim()
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
    [searchQuery, searchType, selectedCategoriaId],
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

  const handleSearchSubmit = () => {
    Keyboard.dismiss() // Esconde teclado
    fetchPromocoes()
  }

  const handleApplyFilters = () => {
    fetchPromocoes()
    setFilterModalVisible(false)
  }

  const openPromotionDetails = (promocaoId: number) => {
    navigation.navigate("PromocaoDetail", { promocaoId: promocaoId })
  }

  // --- Renderização ---
  const renderHeader = () => (
    <View style={homeStyles.headerContainer}>
      <View style={homeStyles.searchFilterContainer}>
        <View style={homeStyles.searchBarContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={homeStyles.searchIcon} />
          <TextInput
            style={homeStyles.searchBar}
            placeholder={`Buscar por ${searchType === "produto" ? "produto" : "fornecedor"}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit} // Busca ao pressionar enter/done
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("")
                fetchPromocoes() /* Refaz busca sem termo */
              }}
              style={homeStyles.clearSearchIcon}
            >
              <Ionicons name="close-circle" size={20} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={homeStyles.filterButton}>
          <Ionicons name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
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

      {/* Resto do código permanece igual... */}
      {/* Modal de Filtro */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity style={homeStyles.modalOverlay} onPress={() => setFilterModalVisible(false)} activeOpacity={1}>
          <TouchableOpacity
            style={[
              homeStyles.modalContent,
              // Se for desktop, centraliza o modal e limita a largura
              Platform.OS === "web" &&
                width > 768 && {
                  width: "50%",
                  alignSelf: "center",
                  marginBottom: "10%",
                  borderRadius: 12,
                  maxHeight: "60%",
                },
            ]}
            activeOpacity={1}
            onPress={Keyboard.dismiss}
          >
            <Text style={homeStyles.modalTitle}>Filtros</Text>

            <Text style={homeStyles.modalLabel}>Buscar em:</Text>
            <View style={homeStyles.pickerContainerModal}>
              <Picker
                selectedValue={searchType}
                onValueChange={(itemValue) => setSearchType(itemValue)}
                style={homeStyles.pickerStyle}
              >
                <Picker.Item label="Nome do Produto" value="produto" />
                <Picker.Item label="Nome do Fornecedor" value="fornecedor" />
              </Picker>
            </View>

            <Text style={homeStyles.modalLabel}>Categoria:</Text>
            <View style={homeStyles.pickerContainerModal}>
              <Picker
                selectedValue={selectedCategoriaId}
                onValueChange={(itemValue) => setSelectedCategoriaId(itemValue)}
                style={homeStyles.pickerStyle}
              >
                <Picker.Item label="Todas as Categorias" value={undefined} />
                {categoriasFiltro.map((cat) => (
                  <Picker.Item key={cat.categoria_id.toString()} label={cat.categoria_nome} value={cat.categoria_id} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity style={homeStyles.applyFilterButton} onPress={handleApplyFilters}>
              <Text style={homeStyles.applyFilterButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
            <TouchableOpacity style={homeStyles.closeFilterButton} onPress={() => setFilterModalVisible(false)}>
              <Text style={homeStyles.closeFilterButtonText}>Fechar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default InicioScreen
