import React, { useState, useCallback, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useWindowDimensions } from "react-native"
import { promotionListStyles } from "../../common/styles/Promotions/promotionListScreen.styled"
import PromotionTable from "../../components/Promotions/PromotionTable"
import { useSearch } from "../../contexts/SearchHomeContext/searchHomeContext"
import promocaoService from "../../services/promocaoService"
import categoriaService from "../../services/categoriaService"
import CustomHeaderPromotion from "../../components/Common/customHeader/customHeaderPromotion"

// Tipo para o item da lista de promoções (admin view)
interface PromocaoAdminItem {
  promocao_id: number
  promocao_descricao?: string | null
  fornecedor?: { pessoa_nome?: string }
  inicio: string | Date
  fim?: string | Date | null
  ativo: boolean
}

const PromotionComponent = () => {
  const navigation = useNavigation<any>()
  const { width } = useWindowDimensions()
  const {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    searchType,
    setSearchType,
    performSearch,
    setPerformSearch,
    selectedCategoriaId,
    setSelectedCategoriaId,
    categoriasFiltro,
    setCategoriasFiltro,
    selectedFilters,
    setSelectedFilters,
  } = useSearch()

  const [promocoes, setPromocoes] = useState<PromocaoAdminItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Carregar categorias para filtros
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const categorias = await categoriaService.listarCategorias()
        setCategoriasFiltro(categorias || [])
      } catch (err) {
        console.error("Erro ao carregar categorias:", err)
      }
    }
    loadCategorias()
  }, [setCategoriasFiltro])

  const fetchPromocoesAdmin = useCallback(async (isRefreshing = false) => {
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
      const data = await promocaoService.listarPromocoes(params)
      setPromocoes(data || [])
    } catch (err: any) {
      console.error("Erro buscar promoções admin:", err.response?.data || err.message || err)
      setError("Erro ao carregar promoções.")
      setPromocoes([])
    } finally {
      if (!isRefreshing) setLoading(false)
      setRefreshing(false)
    }
  }, [debouncedQuery, searchType, selectedCategoriaId])

  // Definir performSearch
  useEffect(() => {
    setPerformSearch(() => fetchPromocoesAdmin)
  }, [setPerformSearch, fetchPromocoesAdmin])

  useFocusEffect(useCallback(() => { fetchPromocoesAdmin() }, [fetchPromocoesAdmin]))

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPromocoesAdmin(true)
  }

  const handleEdit = (promocao: PromocaoAdminItem) => {
    navigation.navigate('PromocaoForm', { promocaoId: promocao.promocao_id })
  }

  const handleDeleteToggle = (promocao: PromocaoAdminItem) => {
    const actionText = promocao.ativo ? "desativar" : "reativar"
    const newStatus = !promocao.ativo
    Alert.alert(
      `Confirmar ${actionText}`,
      `Tem certeza que deseja ${actionText} a promoção "${promocao.promocao_descricao || promocao.promocao_id}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: `Sim, ${actionText}`,
          style: promocao.ativo ? "destructive" : "default",
          onPress: async () => {
            setLoading(true)
            try {
              if (promocao.ativo) {
                await promocaoService.excluirPromocao(promocao.promocao_id)
              } else {
                await promocaoService.atualizarPromocao(promocao.promocao_id, { ativo: newStatus })
              }
              Alert.alert("Sucesso", `Promoção ${actionText} com sucesso!`)
              fetchPromocoesAdmin()
            } catch (err: any) {
              const msg = err.response?.data?.message || err.message || `Erro ao ${actionText}.`
              Alert.alert("Erro", msg)
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const renderContent = () => {
    if (loading && !refreshing && promocoes.length === 0) {
      return <ActivityIndicator size="large" color="#007bff" style={promotionListStyles.centered} />
    }
    if (error) {
      return (
        <View style={promotionListStyles.centered}>
          <Text style={promotionListStyles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchPromocoesAdmin()} style={promotionListStyles.retryButton}>
            <Text style={promotionListStyles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return (
      <PromotionTable
        promocoes={promocoes}
        onEdit={handleEdit}
        onDelete={handleDeleteToggle}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f8' }}>
      <CustomHeaderPromotion
        showFilter={true}
        showAddButton={true}
        onAddPress={() => navigation.navigate('PromocaoForm')}
      />
      <View style={promotionListStyles.container}>
        {renderContent()}
      </View>
    </SafeAreaView>
  )
}

export default PromotionComponent