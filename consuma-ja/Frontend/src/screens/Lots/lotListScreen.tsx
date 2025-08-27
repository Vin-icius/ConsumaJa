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
import { lotListStyles } from "../../common/styles/Lots/lotListScreen.styled"

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

const LotListScreen = () => {
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
    <View style={[lotListStyles.loteCard, !item.ativo && lotListStyles.loteInativo]}>
      <View style={lotListStyles.loteHeader}>
        <Text style={lotListStyles.loteCodigo}>{item.lote_codigo}</Text>
        <View style={lotListStyles.loteActions}>
          <TouchableOpacity style={lotListStyles.actionButton} onPress={() => editarLote(item.lote_id)}>
            <Ionicons name="pencil-outline" size={20} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity style={lotListStyles.actionButton} onPress={() => confirmarExclusao(item)}>
            <Ionicons name="trash-outline" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={lotListStyles.loteInfo}>
        <Text style={lotListStyles.loteProduto}>
          <Text style={lotListStyles.infoLabel}>Produto: </Text>
          {item.produto?.produto_nome || `ID: ${item.produto_id}`}
        </Text>
        <View style={lotListStyles.infoRow}>
          <Text style={lotListStyles.infoItem}>
            <Text style={lotListStyles.infoLabel}>Validade: </Text>
            {formatarData(item.lote_validade)}
          </Text>
          <Text style={lotListStyles.infoItem}>
            <Text style={lotListStyles.infoLabel}>Entrada: </Text>
            {formatarData(item.data_entrada)}
          </Text>
        </View>
        <View style={lotListStyles.infoRow}>
          <Text style={lotListStyles.infoItem}>
            <Text style={lotListStyles.infoLabel}>Qtd. Inicial: </Text>
            {item.lote_quantidade_inicial}
          </Text>
          <Text style={lotListStyles.infoItem}>
            <Text style={lotListStyles.infoLabel}>Qtd. Atual: </Text>
            {item.lote_quantidade_atual}
          </Text>
        </View>
        <View style={lotListStyles.statusBadge}>
          <Text style={lotListStyles.statusText}>{item.ativo ? "Ativo" : "Inativo"}</Text>
        </View>
      </View>
    </View>
  )

  return (
    <View style={lotListStyles.container}>
      {/* Cabeçalho com título e botão de adicionar */}
      <View style={lotListStyles.header}>
        <Text style={lotListStyles.title}>Lotes</Text>
        <TouchableOpacity style={lotListStyles.addButton} onPress={criarNovoLote}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={lotListStyles.addButtonText}>Novo Lote</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={lotListStyles.filtersContainer}>
        <View style={lotListStyles.searchContainer}>
          <TextInput
            style={lotListStyles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por código ou produto..."
            onSubmitEditing={pesquisarLotes}
          />
          <TouchableOpacity style={lotListStyles.searchButton} onPress={pesquisarLotes}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={lotListStyles.filterButtons}>
          <TouchableOpacity
            style={[lotListStyles.filterButton, filtroAtivo !== null && lotListStyles.filterButtonActive]}
            onPress={alternarFiltroStatus}
          >
            <Text style={lotListStyles.filterButtonText}>
              {filtroAtivo === null ? "Todos" : filtroAtivo ? "Ativos" : "Inativos"}
            </Text>
          </TouchableOpacity>

          {(searchQuery || filtroAtivo !== null || filtroProdutoId) && (
            <TouchableOpacity style={lotListStyles.clearFiltersButton} onPress={limparFiltros}>
              <Ionicons name="close-circle" size={20} color="#dc3545" />
              <Text style={lotListStyles.clearFiltersText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de lotes */}
      <FlatList
        data={lotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.lote_id.toString()}
        contentContainerStyle={lotListStyles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={carregarMaisLotes}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={lotListStyles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#adb5bd" />
            <Text style={lotListStyles.emptyText}>Nenhum lote encontrado</Text>
          </View>
        }
        ListFooterComponent={
          loading && !refreshing ? <ActivityIndicator size="large" color="#007bff" style={lotListStyles.loader} /> : null
        }
      />
    </View>
  )
}

export default LotListScreen
