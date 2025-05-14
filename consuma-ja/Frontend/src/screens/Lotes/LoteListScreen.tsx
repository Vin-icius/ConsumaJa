"use client"

import { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  RefreshControl,
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import promocaoService from "../../services/promocaoService"

// Tipos
interface Lote {
  lote_id: number
  produto_id: number
  produto?: {
    produto_nome: string
    produto_imagem_url?: string
  }
  lote_codigo: string
  lote_validade: string
  lote_quantidade_inicial: number
  lote_quantidade_atual: number
  data_entrada: string
  ativo: boolean
}

const ITEMS_PER_PAGE = 15

const LoteListScreen = () => {
  const navigation = useNavigation<any>()

  // Estados
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | null>(null) // null = todos, true = ativos, false = inativos
  const [filtroProdutoId, setFiltroProdutoId] = useState<number | null>(null)

  // Carregar lotes
  const carregarLotes = useCallback(
    async (pageToLoad = 1, shouldRefresh = false) => {
      if (shouldRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      try {
        const params: any = {
          page: pageToLoad,
          limit: ITEMS_PER_PAGE,
        }

        // Adicionar filtros se existirem
        if (searchQuery.trim()) {
          params.query = searchQuery.trim()
        }

        if (filtroAtivo !== null) {
          params.ativo = filtroAtivo
        }

        if (filtroProdutoId) {
          params.produtoId = filtroProdutoId
        }

        const result = await promocaoService.listarLotes(params)

        if (result && result.data) {
          if (pageToLoad === 1 || shouldRefresh) {
            setLotes(result.data)
          } else {
            setLotes((prev) => [...prev, ...result.data])
          }

          setPage(pageToLoad)
          setTotalPages(result.totalPages || 1)
        }
      } catch (error) {
        console.error("Erro ao carregar lotes:", error)
        Alert.alert("Erro", "Não foi possível carregar os lotes.")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [searchQuery, filtroAtivo, filtroProdutoId],
  )

  // Recarregar ao focar na tela
  useFocusEffect(
    useCallback(() => {
      carregarLotes(1, true)
    }, [carregarLotes]),
  )

  // Carregar mais lotes ao rolar
  const carregarMaisLotes = () => {
    if (page < totalPages && !loading) {
      carregarLotes(page + 1)
    }
  }

  // Atualizar lista (pull-to-refresh)
  const onRefresh = () => {
    carregarLotes(1, true)
  }

  // Pesquisar lotes
  const pesquisarLotes = () => {
    carregarLotes(1, true)
  }

  // Alternar filtro de status
  const alternarFiltroStatus = () => {
    // Ciclo: null (todos) -> true (ativos) -> false (inativos) -> null (todos)
    const novoFiltro = filtroAtivo === null ? true : filtroAtivo === true ? false : null
    setFiltroAtivo(novoFiltro)
    carregarLotes(1, true)
  }

  // Limpar filtros
  const limparFiltros = () => {
    setSearchQuery("")
    setFiltroAtivo(null)
    setFiltroProdutoId(null)
    carregarLotes(1, true)
  }

  // Excluir lote
  const confirmarExclusao = (lote: Lote) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Deseja realmente excluir o lote ${lote.lote_codigo}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => excluirLote(lote.lote_id) },
      ],
      { cancelable: true },
    )
  }

  const excluirLote = async (loteId: number) => {
    setLoading(true)
    try {
      await promocaoService.excluirLote(loteId)
      Alert.alert("Sucesso", "Lote excluído com sucesso!")
      carregarLotes(1, true)
    } catch (error) {
      console.error("Erro ao excluir lote:", error)
      Alert.alert("Erro", "Não foi possível excluir o lote.")
    } finally {
      setLoading(false)
    }
  }

  // Navegar para tela de edição
  const editarLote = (loteId: number) => {
    navigation.navigate("LoteForm", { loteId })
  }

  // Navegar para tela de criação
  const criarNovoLote = () => {
    navigation.navigate("LoteForm")
  }

  // Formatar data para exibição
  const formatarData = (dataString: string | null) => {
    if (!dataString) return "N/A"
    return new Date(dataString).toLocaleDateString("pt-BR")
  }

  // Renderizar item da lista
  const renderItem = ({ item }: { item: Lote }) => (
    <View style={[styles.loteCard, !item.ativo && styles.loteInativo]}>
      <View style={styles.loteHeader}>
        <Text style={styles.loteCodigo}>{item.lote_codigo}</Text>
        <View style={styles.loteActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => editarLote(item.lote_id)}>
            <Ionicons name="pencil-outline" size={20} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => confirmarExclusao(item)}>
            <Ionicons name="trash-outline" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.loteInfo}>
        <Text style={styles.loteProduto}>
          <Text style={styles.infoLabel}>Produto: </Text>
          {item.produto?.produto_nome || `ID: ${item.produto_id}`}
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoItem}>
            <Text style={styles.infoLabel}>Validade: </Text>
            {formatarData(item.lote_validade)}
          </Text>
          <Text style={styles.infoItem}>
            <Text style={styles.infoLabel}>Entrada: </Text>
            {formatarData(item.data_entrada)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoItem}>
            <Text style={styles.infoLabel}>Qtd. Inicial: </Text>
            {item.lote_quantidade_inicial}
          </Text>
          <Text style={styles.infoItem}>
            <Text style={styles.infoLabel}>Qtd. Atual: </Text>
            {item.lote_quantidade_atual}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.ativo ? "Ativo" : "Inativo"}</Text>
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Cabeçalho com título e botão de adicionar */}
      <View style={styles.header}>
        <Text style={styles.title}>Lotes</Text>
        <TouchableOpacity style={styles.addButton} onPress={criarNovoLote}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Novo Lote</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por código ou produto..."
            onSubmitEditing={pesquisarLotes}
          />
          <TouchableOpacity style={styles.searchButton} onPress={pesquisarLotes}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filtroAtivo !== null && styles.filterButtonActive]}
            onPress={alternarFiltroStatus}
          >
            <Text style={styles.filterButtonText}>
              {filtroAtivo === null ? "Todos" : filtroAtivo ? "Ativos" : "Inativos"}
            </Text>
          </TouchableOpacity>

          {(searchQuery || filtroAtivo !== null || filtroProdutoId) && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={limparFiltros}>
              <Ionicons name="close-circle" size={20} color="#dc3545" />
              <Text style={styles.clearFiltersText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de lotes */}
      <FlatList
        data={lotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.lote_id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={carregarMaisLotes}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#adb5bd" />
            <Text style={styles.emptyText}>Nenhum lote encontrado</Text>
          </View>
        }
        ListFooterComponent={
          loading && !refreshing ? <ActivityIndicator size="large" color="#007bff" style={styles.loader} /> : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#212529",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 4,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
  },
  filterButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ced4da",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#e9ecef",
    borderColor: "#adb5bd",
  },
  filterButtonText: {
    color: "#495057",
    fontSize: 14,
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    color: "#dc3545",
    marginLeft: 4,
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  loteCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loteInativo: {
    opacity: 0.7,
    borderStyle: "dashed",
  },
  loteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  loteCodigo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  loteActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  loteInfo: {
    position: "relative",
  },
  loteProduto: {
    fontSize: 16,
    marginBottom: 8,
    color: "#495057",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoItem: {
    fontSize: 14,
    color: "#6c757d",
  },
  infoLabel: {
    fontWeight: "500",
    color: "#495057",
  },
  statusBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#e9ecef",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#495057",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
  loader: {
    marginVertical: 20,
  },
})

export default LoteListScreen
