// src/screens/Product/ProductListScreen.tsx
"use client"

import React, { useState, useCallback, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
  ScrollView,
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"

import produtoService from "../../services/produtoService"
import pessoaService from "../../services/pessoaService"
import { productListStyles } from "../../common/styles/Product/productListScreen.styled"
import {
  ProductManagementProvider,
  useProductManagement,
  ProductStatusFilter,
  ProductActiveFilter,
  SupplierOption,
} from "../../contexts/ProductContext/productManagementContext"
import { useApplication } from "../../contexts/ApplicationContext/ApplicationContext"
import ProductTable, { ProductTableItem } from "../../components/Product/ProductTable"

interface PaginatedProdutosResponse {
  data?: ProductTableItem[]
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

const ITEMS_PER_PAGE = 15
const SUPPLIER_PAGE_LIMIT = 50

const ProductListScreenContent = () => {
  const navigation = useNavigation<any>()
  const { user } = useApplication()
  const isAdmin = user?.pessoa_tipo === "Admin"
  const loggedSupplierId = !isAdmin && user?.pessoa_id ? Number(user.pessoa_id) : null

  const [produtos, setProdutos] = useState<ProductTableItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalProdutos, setTotalProdutos] = useState(0)

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    ativoFilter,
    setAtivoFilter,
    selectedSupplierId,
    setSelectedSupplierId,
    supplierOptions,
    setSupplierOptions,
    resetFilters,
    setPerformSearch,
    isSearching,
    setIsSearching,
  } = useProductManagement()

  const fetchProdutos = useCallback(
    async (page = 1, isRefreshing = false, isNewSearchOrFilter = false) => {
      const shouldFlagSearching = page === 1 || isRefreshing || isNewSearchOrFilter

      if (page === 1 && !isRefreshing) setLoading(true)
      if (isRefreshing) setRefreshing(true)
      if (page > 1 && !isNewSearchOrFilter) setLoadingMore(true)
      if (shouldFlagSearching) setIsSearching(true)
      setError(null)

      try {
        const params: Record<string, any> = { page, limit: ITEMS_PER_PAGE }
        const trimmedQuery = searchQuery.trim()
        if (trimmedQuery) params.nomeQuery = trimmedQuery
        if (ativoFilter !== "all") params.ativo = ativoFilter === "true"
        if (statusFilter !== "ALL") params.produto_status = statusFilter
        if (selectedSupplierId) params.fornecedorId = selectedSupplierId

        const response: PaginatedProdutosResponse = await produtoService.listarProdutos(params)
        const payload = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response as any)
            ? (response as unknown as ProductTableItem[])
            : []

        setProdutos((prev) => (page === 1 || isNewSearchOrFilter ? payload : [...prev, ...payload]))
        setTotalPages(response.totalPages || Math.max(1, Math.ceil((response.total ?? payload.length) / ITEMS_PER_PAGE)))
        setTotalProdutos(response.total ?? payload.length)
        setCurrentPage(response.page || page)
      } catch (err: any) {
        console.error("[ProductListScreen] Falha ao carregar produtos", err?.response?.data || err?.message || err)
        setError("Não foi possível carregar os produtos.")
        if (page === 1 || isNewSearchOrFilter) setProdutos([])
      } finally {
        setLoading(false)
        setRefreshing(false)
        setLoadingMore(false)
        if (shouldFlagSearching) {
          setIsSearching(false)
        }
      }
    },
    [ativoFilter, searchQuery, selectedSupplierId, setIsSearching, statusFilter],
  )

  useEffect(() => {
    setPerformSearch(() => () => fetchProdutos(1, false, true))
  }, [fetchProdutos, setPerformSearch])

  useFocusEffect(
    useCallback(() => {
      fetchProdutos(1, true, true)
    }, [fetchProdutos]),
  )

  useEffect(() => {
    const seedSuppliers = async () => {
      if (!isAdmin && loggedSupplierId) {
        setSelectedSupplierId(loggedSupplierId)
        setSupplierOptions([
          {
            pessoa_id: loggedSupplierId,
            pessoa_nome: user?.pessoa_nome || "Seu cadastro",
          },
        ])
        return
      }

      if (!isAdmin) {
        return
      }

      const extractSuppliers = (payload: any): SupplierOption[] => {
        const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
        return rows
          .map((row: any) => ({
            pessoa_id: Number(row.pessoa_id),
            pessoa_nome: row.pessoa_nome || row.nome || "Fornecedor",
          }))
          .filter((supplier: SupplierOption) => Number.isFinite(supplier.pessoa_id))
      }

      setLoadingSuppliers(true)
      try {
        const baseParams = {
          pessoa_tipo: "Juridica",
          pessoa_status: 1,
          limit: SUPPLIER_PAGE_LIMIT,
        }

        const firstResponse = await pessoaService.listarPessoas({ ...baseParams, page: 1 })
        const totalPages = firstResponse?.totalPages || 1
        let aggregated = extractSuppliers(firstResponse)

        if (totalPages > 1) {
          for (let page = 2; page <= totalPages; page++) {
            try {
              const pagedResponse = await pessoaService.listarPessoas({ ...baseParams, page })
              aggregated = aggregated.concat(extractSuppliers(pagedResponse))
            } catch (pageError) {
              console.error(`[ProductListScreen] Falha ao carregar fornecedores da página ${page}`, pageError)
              break
            }
          }
        }

        setSupplierOptions(aggregated)
      } catch (err) {
        console.error("[ProductListScreen] Não foi possível carregar os fornecedores", err)
      } finally {
        setLoadingSuppliers(false)
      }
    }

    seedSuppliers()
  }, [isAdmin, loggedSupplierId, setSelectedSupplierId, setSupplierOptions, user?.pessoa_nome])

  const handleRefresh = () => {
    setCurrentPage(1)
    fetchProdutos(1, true, true)
  }

  const pesquisarProdutos = () => {
    setCurrentPage(1)
    fetchProdutos(1, false, true)
  }

  const limparFiltros = () => {
    setCurrentPage(1)
    resetFilters()
    if (!isAdmin && loggedSupplierId) {
      setSelectedSupplierId(loggedSupplierId)
    }
  }

  const handleEdit = (produto: ProductTableItem) => {
    navigation.navigate("ProductForm", { produtoParaEditarId: produto.produto_id })
  }

  const handleDelete = (produto: ProductTableItem) => {
    Alert.alert(
      "Confirmar ação",
      `Tem certeza que deseja desativar o produto "${produto.produto_nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desativar",
          style: "destructive",
          onPress: async () => {
            setLoading(true)
            try {
              await produtoService.excluirProduto(produto.produto_id)
              Alert.alert("Sucesso", "Produto desativado com sucesso.")
              fetchProdutos(currentPage, false, true)
            } catch (err: any) {
              const message = err?.response?.data?.message || err?.message || "Não foi possível desativar o produto."
              Alert.alert("Erro", message)
            } finally {
              setLoading(false)
            }
          },
        },
      ],
    )
  }

  const criarNovoProduto = () => {
    navigation.navigate("ProductForm")
  }

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentPage > 1) {
      const targetPage = currentPage - 1
      setCurrentPage(targetPage)
      fetchProdutos(targetPage, false, false)
    }
    if (direction === "next" && currentPage < totalPages) {
      const targetPage = currentPage + 1
      setCurrentPage(targetPage)
      fetchProdutos(targetPage, false, false)
    }
  }

  const filtersApplied = Boolean(
    searchQuery.trim() ||
      statusFilter !== "ALL" ||
      ativoFilter !== "all" ||
      (isAdmin && selectedSupplierId),
  )

  const showingStart = produtos.length ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0
  const showingEnd = produtos.length ? showingStart + produtos.length - 1 : 0

  return (
    <View style={productListStyles.container}>
      <View style={productListStyles.header}>
        <View>
          <Text style={productListStyles.title}>Gerenciar Produtos</Text>
          <Text style={productListStyles.subtitle}>Pesquise, filtre e acompanhe seus cadastros</Text>
        </View>
        <TouchableOpacity style={productListStyles.addButton} onPress={criarNovoProduto}>
          <Ionicons name="add" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={productListStyles.scrollArea}
        contentContainerStyle={productListStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#0d6efd"]} />}
      >
        <View style={productListStyles.filtersCard}>
          <View style={productListStyles.searchRow}>
            <Ionicons name="search" size={18} color="#adb5bd" style={productListStyles.searchIcon} />
            <TextInput
              style={productListStyles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nome do produto"
              returnKeyType="search"
              onSubmitEditing={pesquisarProdutos}
            />
          </View>

          <View style={productListStyles.filtersRow}>
            <View style={productListStyles.filterBlock}>
              <Text style={productListStyles.filterLabel}>Status</Text>
              <Picker
                selectedValue={statusFilter}
                onValueChange={(value) => {
                  setCurrentPage(1)
                  setStatusFilter(value as ProductStatusFilter)
                }}
                style={productListStyles.filterPicker}
              >
                <Picker.Item label="Todos" value="ALL" />
                <Picker.Item label="Aprovados" value="APROVADO" />
                <Picker.Item label="Pendentes" value="PENDENTE" />
                <Picker.Item label="Rejeitados" value="REJEITADO" />
              </Picker>
            </View>

            <View style={productListStyles.filterBlock}>
              <Text style={productListStyles.filterLabel}>Atividade</Text>
              <Picker
                selectedValue={ativoFilter}
                onValueChange={(value) => {
                  setCurrentPage(1)
                  setAtivoFilter(value as ProductActiveFilter)
                }}
                style={productListStyles.filterPicker}
              >
                <Picker.Item label="Todos" value="all" />
                <Picker.Item label="Ativos" value="true" />
                <Picker.Item label="Inativos" value="false" />
              </Picker>
            </View>

            {isAdmin && (
              <View style={productListStyles.filterBlockWide}>
                <Text style={productListStyles.filterLabel}>Fornecedor</Text>
                <Picker
                  selectedValue={selectedSupplierId ?? "__all"}
                  onValueChange={(value) => {
                    setCurrentPage(1)
                    setSelectedSupplierId(value === "__all" ? null : Number(value))
                  }}
                  enabled={!loadingSuppliers}
                  style={productListStyles.filterPicker}
                >
                  <Picker.Item label={loadingSuppliers ? "Carregando fornecedores..." : "Todos"} value="__all" />
                  {supplierOptions.map((supplier) => (
                    <Picker.Item
                      key={supplier.pessoa_id}
                      label={supplier.pessoa_nome}
                      value={supplier.pessoa_id}
                    />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          {filtersApplied && (
            <TouchableOpacity style={productListStyles.clearFiltersButton} onPress={limparFiltros}>
              <Ionicons name="close-circle-outline" size={18} color="#495057" />
              <Text style={productListStyles.clearFiltersText}>Limpar filtros</Text>
            </TouchableOpacity>
          )}

          {isSearching && (
            <View style={productListStyles.searchingBadge}>
              <ActivityIndicator size="small" color="#0d6efd" />
              <Text style={productListStyles.searchingText}>Atualizando resultados...</Text>
            </View>
          )}
        </View>

        <View style={productListStyles.tableCard}>
          {error && produtos.length === 0 ? (
            <View style={productListStyles.errorState}>
              <Ionicons name="alert-circle" size={54} color="#e03131" />
              <Text style={productListStyles.errorTitle}>Ops! {"\n"}Algo saiu errado.</Text>
              <Text style={productListStyles.errorSubtitle}>{error}</Text>
              <TouchableOpacity style={productListStyles.retryButton} onPress={() => fetchProdutos(1, false, true)}>
                <Text style={productListStyles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ProductTable
                produtos={produtos}
                isAdminView={isAdmin}
                onEdit={handleEdit}
                onDeactivate={handleDelete}
              />

              <View style={productListStyles.tableFooter}>
                <View>
                  <Text style={productListStyles.paginationLabel}>
                    {totalProdutos > 0
                      ? `Mostrando ${showingStart} - ${showingEnd} de ${totalProdutos}`
                      : "Nenhum produto encontrado"}
                  </Text>
                </View>

                <View style={productListStyles.paginationControls}>
                  <TouchableOpacity
                    style={[productListStyles.pageButton, currentPage === 1 && productListStyles.pageButtonDisabled]}
                    disabled={currentPage === 1 || loading}
                    onPress={() => handlePageChange("prev")}
                  >
                    <Ionicons name="chevron-back" size={16} color="#fff" />
                  </TouchableOpacity>
                  <Text style={productListStyles.pageIndicator}>
                    {Math.min(currentPage, totalPages || 1)} / {Math.max(totalPages, 1)}
                  </Text>
                  <TouchableOpacity
                    style={[
                      productListStyles.pageButton,
                      currentPage >= totalPages && productListStyles.pageButtonDisabled,
                    ]}
                    disabled={currentPage >= totalPages || loadingMore || totalPages === 0}
                    onPress={() => handlePageChange("next")}
                  >
                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                  {loadingMore && <ActivityIndicator style={{ marginLeft: 12 }} size="small" color="#0d6efd" />}
                </View>
              </View>
            </>
          )}

          {loading && produtos.length === 0 && (
            <View style={productListStyles.tableOverlay}>
              <ActivityIndicator size="large" color="#0d6efd" />
              <Text style={productListStyles.overlayText}>Carregando produtos...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const ProductListScreen = () => (
  <ProductManagementProvider>
    <ProductListScreenContent />
  </ProductManagementProvider>
)

export default ProductListScreen
