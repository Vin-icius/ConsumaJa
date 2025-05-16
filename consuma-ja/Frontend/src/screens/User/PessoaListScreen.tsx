"use client"

import { useState, useCallback, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import pessoaService from "../../services/pessoaService"
import { Picker } from "@react-native-picker/picker"

// Definir tipo para Pessoa
interface PessoaItem {
  pessoa_id: number
  pessoa_nome: string
  pessoa_email: string
  pessoa_tipo: string // Admin, Fisica, Juridica
  pessoa_status: number
  pessoa_telefone?: string
  ativo: boolean // Mapeado de pessoa_status
}

// Tipo para os parâmetros de filtro
interface FilterParams {
  page: number
  limit: number
  pessoa_tipo?: string
  pessoa_status?: number
}

// Tipo para resposta da API
interface ApiResponse {
  data: any[]
  page: number
  totalPages: number
  total: number
  limit: number
}

const ITEMS_PER_PAGE = 10 // Ajustado para 10 clientes por página

const PessoaListScreen = () => {
  const navigation = useNavigation<any>()

  // Estados
  const [pessoas, setPessoas] = useState<PessoaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados de filtro
  const [filtroTipo, setFiltroTipo] = useState<string>("")
  const [filtroAtivo, setFiltroAtivo] = useState<string>("")

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  // Função para construir os parâmetros de filtro
  const buildFilterParams = (page: number): FilterParams => {
    const params: FilterParams = {
      page,
      limit: ITEMS_PER_PAGE,
    }

    if (filtroTipo) {
      params.pessoa_tipo = filtroTipo
    }

    if (filtroAtivo !== "") {
      params.pessoa_status = filtroAtivo === "true" ? 1 : 0
    }

    return params
  }

  // Carregar pessoas
  const fetchPessoas = useCallback(
    async (page = 1, isRefreshing = false) => {
      if (page === 1 && !isRefreshing) setLoading(true)
      if (isRefreshing) setRefreshing(true)
      if (page > 1) setLoadingMore(true)
      setError(null)

      try {
        const params = buildFilterParams(page)
        console.log("Buscando pessoas com params:", params)

        const response = await pessoaService.listarPessoas(params)

        // Verificar se a resposta tem o formato esperado
        if (response && Array.isArray(response.data)) {
          // Mapeia os dados para incluir a propriedade 'ativo' baseada em pessoa_status
          const pessoasComAtivo = response.data.map((pessoa: any) => ({
            ...pessoa,
            ativo: pessoa.pessoa_status === 1,
          }))

          setPessoas(pessoasComAtivo) // Sempre substituímos os dados ao mudar de página
          setTotalPages(response.totalPages || Math.ceil(response.total / ITEMS_PER_PAGE) || 1)
          setCurrentPage(page)
        } else if (response && Array.isArray(response)) {
          // Caso a API retorne um array diretamente sem paginação
          const pessoasComAtivo = response.map((pessoa: any) => ({
            ...pessoa,
            ativo: pessoa.pessoa_status === 1,
          }))
          setPessoas(pessoasComAtivo)
          setTotalPages(Math.ceil(pessoasComAtivo.length / ITEMS_PER_PAGE) || 1)
          setCurrentPage(page)
        } else {
          console.error("Formato de resposta inválido:", response)
          setError("Formato de resposta inválido. Contate o suporte.")
          setPessoas([])
        }
      } catch (err: any) {
        console.error("Erro ao buscar pessoas:", err)
        const errorMessage = err.response?.data?.message || err.message || "Erro ao carregar usuários."
        setError(`Erro: ${errorMessage}. Verifique a conexão com o servidor.`)
        setPessoas([])
      } finally {
        setLoading(false)
        setRefreshing(false)
        setLoadingMore(false)
      }
    },
    [filtroTipo, filtroAtivo],
  )

  // Buscar dados quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1)
      fetchPessoas(1, true)
    }, []),
  )

  // Aplicar filtros automaticamente quando mudam
  useEffect(() => {
    setCurrentPage(1)
    fetchPessoas(1, false)
  }, [filtroTipo, filtroAtivo])

  const handleRefresh = () => {
    setCurrentPage(1)
    fetchPessoas(1, true)
  }

  // Limpar filtros
  const limparFiltros = () => {
    setFiltroTipo("")
    setFiltroAtivo("")
    // Não precisamos chamar fetchPessoas aqui, pois o useEffect acima será acionado
  }

  // Navegação para edição
  const handleEdit = (pessoa: PessoaItem) => {
    navigation.navigate("PessoaForm", { pessoaId: pessoa.pessoa_id })
  }

  // Lógica de exclusão (desativação)
  const handleDelete = (pessoa: PessoaItem) => {
    Alert.alert("Confirmar Desativação", `Desativar o usuário "${pessoa.pessoa_nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desativar",
        style: "destructive",
        onPress: async () => {
          setLoading(true)
          try {
            await pessoaService.excluirPessoa(pessoa.pessoa_id)
            Alert.alert("Sucesso", "Usuário desativado com sucesso!")
            fetchPessoas(currentPage, false)
          } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Erro ao desativar."
            Alert.alert("Erro", msg)
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  // Renderizar botões de paginação
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null

    // Determinar quais páginas mostrar (máximo 5 botões)
    let pagesToShow = []
    if (totalPages <= 5) {
      // Se tiver 5 ou menos páginas, mostra todas
      pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1)
    } else {
      // Se tiver mais de 5 páginas, mostra um subconjunto
      if (currentPage <= 3) {
        // Início: 1, 2, 3, 4, 5
        pagesToShow = [1, 2, 3, 4, 5]
      } else if (currentPage >= totalPages - 2) {
        // Final: totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
        pagesToShow = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
      } else {
        // Meio: currentPage-2, currentPage-1, currentPage, currentPage+1, currentPage+2
        pagesToShow = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
      }
    }

    return (
      <View style={styles.paginationContainer}>
        {/* Botão Anterior */}
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={() => currentPage > 1 && fetchPessoas(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? "#aaa" : "#fff"} />
        </TouchableOpacity>

        {/* Botões de Página */}
        {pagesToShow.map((page) => (
          <TouchableOpacity
            key={`page-${page}`}
            style={[styles.paginationButton, currentPage === page && styles.paginationButtonActive]}
            onPress={() => page !== currentPage && fetchPessoas(page)}
          >
            <Text style={[styles.paginationButtonText, currentPage === page && styles.paginationButtonTextActive]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Botão Próximo */}
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
          onPress={() => currentPage < totalPages && fetchPessoas(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages ? "#aaa" : "#fff"} />
        </TouchableOpacity>
      </View>
    )
  }

  // Renderizar tabela
  const renderTable = () => {
    const { width } = Dimensions.get("window")
    const isMobile = width < 768

    if (loading && !refreshing && pessoas.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Carregando usuários...</Text>
        </View>
      )
    }

    if (error && pessoas.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPessoas(1, false)}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )
    }

    // Layout de tabela para desktop, layout de cards para mobile
    if (isMobile) {
      return (
        <FlatList
          data={pessoas}
          keyExtractor={(item) => item.pessoa_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.mobileCard}>
              <View style={styles.mobileCardHeader}>
                <Text style={styles.mobileCardTitle}>{item.pessoa_nome}</Text>
                <View style={[styles.statusBadge, item.ativo ? styles.statusActiveBadge : styles.statusInactiveBadge]}>
                  <Text style={[styles.statusText, item.ativo ? styles.statusActiveText : styles.statusInactiveText]}>
                    {item.ativo ? "Ativo" : "Inativo"}
                  </Text>
                </View>
              </View>

              <View style={styles.mobileCardContent}>
                <Text style={styles.mobileCardLabel}>ID:</Text>
                <Text style={styles.mobileCardValue}>{item.pessoa_id}</Text>
              </View>

              <View style={styles.mobileCardContent}>
                <Text style={styles.mobileCardLabel}>Email:</Text>
                <Text style={styles.mobileCardValue}>{item.pessoa_email}</Text>
              </View>

              <View style={styles.mobileCardContent}>
                <Text style={styles.mobileCardLabel}>Tipo:</Text>
                <Text style={styles.mobileCardValue}>{item.pessoa_tipo}</Text>
              </View>

              {item.pessoa_telefone && (
                <View style={styles.mobileCardContent}>
                  <Text style={styles.mobileCardLabel}>Telefone:</Text>
                  <Text style={styles.mobileCardValue}>{item.pessoa_telefone}</Text>
                </View>
              )}

              <View style={styles.mobileCardActions}>
                <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEdit(item)}>
                  <Ionicons name="pencil-outline" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                {item.ativo && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Desativar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.mobileList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#28a745"]} />}
          ListEmptyComponent={
            <View style={styles.emptyTableRow}>
              <Text style={styles.emptyTableText}>Nenhum usuário encontrado. Tente ajustar os filtros.</Text>
            </View>
          }
        />
      )
    }

    // Layout de tabela para desktop
    return (
      <View style={styles.tableContainer}>
        {/* Cabeçalho da Tabela */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>ID</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Nome</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Email</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Tipo</Text>
          <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Status</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Ações</Text>
        </View>

        {/* Corpo da Tabela */}
        {pessoas.length === 0 ? (
          <View style={styles.emptyTableRow}>
            <Text style={styles.emptyTableText}>Nenhum usuário encontrado. Tente ajustar os filtros.</Text>
          </View>
        ) : (
          <FlatList
            data={pessoas}
            keyExtractor={(item) => item.pessoa_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCellText, { flex: 0.5 }]}>{item.pessoa_id}</Text>
                <Text style={[styles.tableCellText, { flex: 2 }]} numberOfLines={1}>
                  {item.pessoa_nome}
                </Text>
                <Text style={[styles.tableCellText, { flex: 2 }]} numberOfLines={1}>
                  {item.pessoa_email}
                </Text>
                <Text style={[styles.tableCellText, { flex: 1 }]}>{item.pessoa_tipo}</Text>
                <View style={[styles.tableCellContainer, { flex: 0.8 }]}>
                  <View
                    style={[styles.statusBadge, item.ativo ? styles.statusActiveBadge : styles.statusInactiveBadge]}
                  >
                    <Text style={[styles.statusText, item.ativo ? styles.statusActiveText : styles.statusInactiveText]}>
                      {item.ativo ? "Ativo" : "Inativo"}
                    </Text>
                  </View>
                </View>
                <View style={[styles.tableCellContainer, { flex: 1.5 }]}>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEdit(item)}>
                      <Ionicons name="pencil-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                    {item.ativo && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(item)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#28a745"]} />}
          />
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Usuários</Text>
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.filtersRow}>
            {/* Filtro de Tipo */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Tipo:</Text>
              <Picker
                selectedValue={filtroTipo}
                onValueChange={(itemValue) => setFiltroTipo(itemValue)}
                style={styles.picker}
                prompt="Filtrar por Tipo"
              >
                <Picker.Item label="Todos os Tipos" value="" />
                <Picker.Item label="Admin" value="Admin" />
                <Picker.Item label="Pessoa Física" value="Fisica" />
                <Picker.Item label="Pessoa Jurídica" value="Juridica" />
              </Picker>
            </View>

            {/* Filtro de Status */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Status:</Text>
              <Picker
                selectedValue={filtroAtivo}
                onValueChange={(itemValue) => setFiltroAtivo(itemValue)}
                style={styles.picker}
                prompt="Filtrar por Status"
              >
                <Picker.Item label="Todos os Status" value="" />
                <Picker.Item label="Ativos" value="true" />
                <Picker.Item label="Inativos" value="false" />
              </Picker>
            </View>

            {/* Botão Limpar */}
            <TouchableOpacity style={styles.clearFiltersButton} onPress={limparFiltros}>
              <Ionicons name="refresh" size={16} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Limpar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabela de Dados */}
        <View style={styles.contentContainer}>{renderTable()}</View>

        {/* Paginação */}
        <View style={styles.paginationWrapper}>{renderPaginationButtons()}</View>

        {loading && refreshing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f8f0",
    paddingBottom: Platform.OS === "ios" ? 0 : 10, // Adiciona padding extra para Android
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f8f0",
  },
  header: {
    backgroundColor: "#28a745", // Verde para o cabeçalho
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 5,
    fontWeight: "500",
  },
  picker: {
    height: 50,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    color: "#495057",
  },
  clearFiltersButton: {
    backgroundColor: "#6c757d",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    marginTop: 20, // Alinha com os pickers
  },
  buttonIcon: {
    marginRight: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e9f7ef", // Verde claro para o cabeçalho da tabela
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  tableHeaderCell: {
    fontWeight: "bold",
    color: "#212529",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  tableCellContainer: {
    justifyContent: "center",
  },
  tableCellText: {
    fontSize: 14,
    color: "#495057",
  },
  emptyTableRow: {
    padding: 20,
    alignItems: "center",
  },
  emptyTableText: {
    color: "#6c757d",
    fontSize: 16,
    textAlign: "center",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusActiveBadge: {
    backgroundColor: "#d4edda",
  },
  statusInactiveBadge: {
    backgroundColor: "#f8d7da",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusActiveText: {
    color: "#155724",
  },
  statusInactiveText: {
    color: "#721c24",
  },
  actionButtons: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#ffc107",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
  },
  paginationButton: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#28a745",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  paginationButtonActive: {
    backgroundColor: "#218838",
  },
  paginationButtonDisabled: {
    backgroundColor: "#e9ecef",
  },
  paginationButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  paginationButtonTextActive: {
    color: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  loadingText: {
    marginTop: 10,
    color: "#6c757d",
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  paginationWrapper: {
    paddingBottom: Platform.OS === "ios" ? 20 : 10, // Espaço extra na parte inferior
  },
  mobileList: {
    padding: 10,
    paddingBottom: 20, // Espaço extra no final da lista
  },
  mobileCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  mobileCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  mobileCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    flex: 1,
  },
  mobileCardContent: {
    flexDirection: "row",
    marginBottom: 6,
  },
  mobileCardLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6c757d",
    width: 80,
  },
  mobileCardValue: {
    fontSize: 14,
    color: "#212529",
    flex: 1,
  },
  mobileCardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 8,
    backgroundColor: "#007bff",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
})

export default PessoaListScreen
