"use client"

import { useState, useCallback, useEffect } from "react"
import {
  View,
  Text,
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
import { userListStyles } from "../../common/styles/User/userListScreen.styled"
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

const UserListScreen = () => {
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
      <View style={userListStyles.paginationContainer}>
        {/* Botão Anterior */}
        <TouchableOpacity
          style={[userListStyles.paginationButton, currentPage === 1 && userListStyles.paginationButtonDisabled]}
          onPress={() => currentPage > 1 && fetchPessoas(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? "#aaa" : "#fff"} />
        </TouchableOpacity>

        {/* Botões de Página */}
        {pagesToShow.map((page) => (
          <TouchableOpacity
            key={`page-${page}`}
            style={[userListStyles.paginationButton, currentPage === page && userListStyles.paginationButtonActive]}
            onPress={() => page !== currentPage && fetchPessoas(page)}
          >
            <Text style={[userListStyles.paginationButtonText, currentPage === page && userListStyles.paginationButtonTextActive]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Botão Próximo */}
        <TouchableOpacity
          style={[userListStyles.paginationButton, currentPage === totalPages && userListStyles.paginationButtonDisabled]}
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
        <View style={userListStyles.centered}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={userListStyles.loadingText}>Carregando usuários...</Text>
        </View>
      )
    }

    if (error && pessoas.length === 0) {
      return (
        <View style={userListStyles.centered}>
          <Text style={userListStyles.errorText}>{error}</Text>
          <TouchableOpacity style={userListStyles.retryButton} onPress={() => fetchPessoas(1, false)}>
            <Text style={userListStyles.retryButtonText}>Tentar Novamente</Text>
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
            <View style={userListStyles.mobileCard}>
              <View style={userListStyles.mobileCardHeader}>
                <Text style={userListStyles.mobileCardTitle}>{item.pessoa_nome}</Text>
                <View style={[userListStyles.statusBadge, item.ativo ? userListStyles.statusActiveBadge : userListStyles.statusInactiveBadge]}>
                  <Text style={[userListStyles.statusText, item.ativo ? userListStyles.statusActiveText : userListStyles.statusInactiveText]}>
                    {item.ativo ? "Ativo" : "Inativo"}
                  </Text>
                </View>
              </View>

              <View style={userListStyles.mobileCardContent}>
                <Text style={userListStyles.mobileCardLabel}>ID:</Text>
                <Text style={userListStyles.mobileCardValue}>{item.pessoa_id}</Text>
              </View>

              <View style={userListStyles.mobileCardContent}>
                <Text style={userListStyles.mobileCardLabel}>Email:</Text>
                <Text style={userListStyles.mobileCardValue}>{item.pessoa_email}</Text>
              </View>

              <View style={userListStyles.mobileCardContent}>
                <Text style={userListStyles.mobileCardLabel}>Tipo:</Text>
                <Text style={userListStyles.mobileCardValue}>{item.pessoa_tipo}</Text>
              </View>

              {item.pessoa_telefone && (
                <View style={userListStyles.mobileCardContent}>
                  <Text style={userListStyles.mobileCardLabel}>Telefone:</Text>
                  <Text style={userListStyles.mobileCardValue}>{item.pessoa_telefone}</Text>
                </View>
              )}

              <View style={userListStyles.mobileCardActions}>
                <TouchableOpacity style={[userListStyles.actionButton, userListStyles.editButton]} onPress={() => handleEdit(item)}>
                  <Ionicons name="pencil-outline" size={16} color="#fff" />
                  <Text style={userListStyles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                {item.ativo && (
                  <TouchableOpacity
                    style={[userListStyles.actionButton, userListStyles.deleteButton]}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={userListStyles.actionButtonText}>Desativar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={userListStyles.mobileList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#28a745"]} />}
          ListEmptyComponent={
            <View style={userListStyles.emptyTableRow}>
              <Text style={userListStyles.emptyTableText}>Nenhum usuário encontrado. Tente ajustar os filtros.</Text>
            </View>
          }
        />
      )
    }

    // Layout de tabela para desktop
    return (
      <View style={userListStyles.tableContainer}>
        {/* Cabeçalho da Tabela */}
        <View style={userListStyles.tableHeader}>
          <Text style={[userListStyles.tableHeaderCell, { flex: 0.5 }]}>ID</Text>
          <Text style={[userListStyles.tableHeaderCell, { flex: 2 }]}>Nome</Text>
          <Text style={[userListStyles.tableHeaderCell, { flex: 2 }]}>Email</Text>
          <Text style={[userListStyles.tableHeaderCell, { flex: 1 }]}>Tipo</Text>
          <Text style={[userListStyles.tableHeaderCell, { flex: 0.8 }]}>Status</Text>
          <Text style={[userListStyles.tableHeaderCell, { flex: 1.5 }]}>Ações</Text>
        </View>

        {/* Corpo da Tabela */}
        {pessoas.length === 0 ? (
          <View style={userListStyles.emptyTableRow}>
            <Text style={userListStyles.emptyTableText}>Nenhum usuário encontrado. Tente ajustar os filtros.</Text>
          </View>
        ) : (
          <FlatList
            data={pessoas}
            keyExtractor={(item) => item.pessoa_id.toString()}
            renderItem={({ item }) => (
              <View style={userListStyles.tableRow}>
                <Text style={[userListStyles.tableCellText, { flex: 0.5 }]}>{item.pessoa_id}</Text>
                <Text style={[userListStyles.tableCellText, { flex: 2 }]} numberOfLines={1}>
                  {item.pessoa_nome}
                </Text>
                <Text style={[userListStyles.tableCellText, { flex: 2 }]} numberOfLines={1}>
                  {item.pessoa_email}
                </Text>
                <Text style={[userListStyles.tableCellText, { flex: 1 }]}>{item.pessoa_tipo}</Text>
                <View style={[userListStyles.tableCellContainer, { flex: 0.8 }]}>
                  <View
                    style={[userListStyles.statusBadge, item.ativo ? userListStyles.statusActiveBadge : userListStyles.statusInactiveBadge]}
                  >
                    <Text style={[userListStyles.statusText, item.ativo ? userListStyles.statusActiveText : userListStyles.statusInactiveText]}>
                      {item.ativo ? "Ativo" : "Inativo"}
                    </Text>
                  </View>
                </View>
                <View style={[userListStyles.tableCellContainer, { flex: 1.5 }]}>
                  <View style={userListStyles.actionButtons}>
                    <TouchableOpacity style={[userListStyles.actionButton, userListStyles.editButton]} onPress={() => handleEdit(item)}>
                      <Ionicons name="pencil-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                    {item.ativo && (
                      <TouchableOpacity
                        style={[userListStyles.actionButton, userListStyles.deleteButton]}
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
    <SafeAreaView style={userListStyles.safeArea}>
      <View style={userListStyles.container}>
        <View style={userListStyles.header}>
          <Text style={userListStyles.headerTitle}>Usuários</Text>
        </View>

        <View style={userListStyles.filtersContainer}>
          <View style={userListStyles.filtersRow}>
            {/* Filtro de Tipo */}
            <View style={userListStyles.pickerContainer}>
              <Text style={userListStyles.pickerLabel}>Tipo:</Text>
              <Picker
                selectedValue={filtroTipo}
                onValueChange={(itemValue) => setFiltroTipo(itemValue)}
                style={userListStyles.picker}
                prompt="Filtrar por Tipo"
              >
                <Picker.Item label="Todos os Tipos" value="" />
                <Picker.Item label="Admin" value="Admin" />
                <Picker.Item label="Pessoa Física" value="Fisica" />
                <Picker.Item label="Pessoa Jurídica" value="Juridica" />
              </Picker>
            </View>

            {/* Filtro de Status */}
            <View style={userListStyles.pickerContainer}>
              <Text style={userListStyles.pickerLabel}>Status:</Text>
              <Picker
                selectedValue={filtroAtivo}
                onValueChange={(itemValue) => setFiltroAtivo(itemValue)}
                style={userListStyles.picker}
                prompt="Filtrar por Status"
              >
                <Picker.Item label="Todos os Status" value="" />
                <Picker.Item label="Ativos" value="true" />
                <Picker.Item label="Inativos" value="false" />
              </Picker>
            </View>

            {/* Botão Limpar */}
            <TouchableOpacity style={userListStyles.clearFiltersButton} onPress={limparFiltros}>
              <Ionicons name="refresh" size={16} color="#fff" style={userListStyles.buttonIcon} />
              <Text style={userListStyles.buttonText}>Limpar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabela de Dados */}
        <View style={userListStyles.contentContainer}>{renderTable()}</View>

        {/* Paginação */}
        <View style={userListStyles.paginationWrapper}>{renderPaginationButtons()}</View>

        {loading && refreshing && (
          <View style={userListStyles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default UserListScreen
