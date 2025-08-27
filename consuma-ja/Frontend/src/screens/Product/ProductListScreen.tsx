// src/screens/Product/ProductListScreen.tsx
"use client"

import React, { useState, useCallback, useEffect } from "react" // Adicionado useEffect
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  RefreshControl,
  Platform, // Adicionado para estilo do Picker
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import produtoService from "../../services/produtoService" // Garanta que o caminho está correto
import { Picker } from '@react-native-picker/picker'; // Importar Picker
import { productListStyles } from "../../common/styles/Product/productListScreen.styled"

// Definir tipo para o item Produto
interface ProdutoListItem {
  produto_id: number
  produto_nome: string
  produto_status: 'APROVADO' | 'PENDENTE' | 'REJEITADO' // Usar o tipo exato
  produto_precoOriginal: number
  ativo: boolean
  categoria?: { categoria_id?: number; categoria_nome?: string } | null // Adicionado categoria_id
  marca?: { marca_id?: number; marca_nome?: string } | null       // Adicionado marca_id
  tipo?: { tipo_id?: number; tipo_nome?: string } | null          // Adicionado tipo_id
}

// Tipo para a resposta paginada do serviço
interface PaginatedProdutosResponse {
    data: ProdutoListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const ITEMS_PER_PAGE = 15; // Quantos itens carregar por página

const ProductListScreen = () => {
  const navigation = useNavigation<any>()

  // Estados
  const [produtos, setProdutos] = useState<ProdutoListItem[]>([])
  const [loading, setLoading] = useState(false) // Loading principal para primeira carga/nova busca
  const [loadingMore, setLoadingMore] = useState(false); // Loading para "carregar mais"
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filtroStatusProduto, setFiltroStatusProduto] = useState<'APROVADO' | 'PENDENTE' | 'REJEITADO' | ''>(''); // '' para todos
  const [filtroAtivo, setFiltroAtivo] = useState<string>(""); // "" = todos, "true" = ativos, "false" = inativos
  const [error, setError] = useState<string | null>(null)

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProdutos, setTotalProdutos] = useState(0);


  // Carregar produtos
  const fetchProdutos = useCallback(async (page = 1, isRefreshing = false, isNewSearchOrFilter = false) => {
    if (page === 1 && !isRefreshing) setLoading(true); // Loading principal
    if (isRefreshing) setRefreshing(true);
    if (page > 1) setLoadingMore(true); // Loading para paginação
    setError(null);

    try {
      const params: any = { page, limit: ITEMS_PER_PAGE };
      if (searchQuery.trim()) {
        params.nomeQuery = searchQuery.trim();
      }
      if (filtroAtivo !== "") {
        params.ativo = filtroAtivo; // Envia "true" ou "false" como string
      }
      if (filtroStatusProduto !== "") {
        params.produto_status = filtroStatusProduto;
      }

      const response: PaginatedProdutosResponse = await produtoService.listarProdutos(params);

      if (response && response.data) {
        setProdutos(page === 1 || isNewSearchOrFilter ? response.data : [...produtos, ...response.data]);
        setTotalPages(response.totalPages || 0);
        setCurrentPage(response.page || 1);
        setTotalProdutos(response.total || 0);
      } else {
        // Se a resposta não tem 'data', pode ser um array direto (ajuste conforme seu serviço)
        // ou um erro que não foi pego pelo catch
        setProdutos(page === 1 || isNewSearchOrFilter ? (response as any || []) : produtos);
        setTotalPages(0);
        setCurrentPage(1);
        setTotalProdutos(0);
      }
    } catch (err: any) {
      setError("Não foi possível carregar os produtos.");
      if (page === 1 || isNewSearchOrFilter) setProdutos([]); // Limpa em caso de erro na busca inicial/nova
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [searchQuery, filtroAtivo, filtroStatusProduto, produtos]); // 'produtos' é dependência para o append do 'carregar mais'

  // Efeito para buscar quando filtros mudam ou ao focar
  useEffect(() => {
    fetchProdutos(1, false, true); // Força nova busca da página 1
  }, [searchQuery, filtroAtivo, filtroStatusProduto]); // Não incluir fetchProdutos aqui para evitar loop

  useFocusEffect(
    useCallback(() => {
      fetchProdutos(1, true, true); // Força refresh e nova busca da página 1
    }, []) // Executa ao focar
  );


  const handleRefresh = () => {
    setCurrentPage(1); // Reseta a página
    fetchProdutos(1, true, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !refreshing && currentPage < totalPages) {
      fetchProdutos(currentPage + 1, false, false); // Busca próxima página, não é refresh, não é nova busca
    }
  };

  const pesquisarProdutos = () => {
    setCurrentPage(1); // Reseta para a primeira página ao fazer nova busca
    fetchProdutos(1, false, true);
  };

  const limparFiltros = () => {
    setSearchQuery("");
    setFiltroAtivo("");
    setFiltroStatusProduto("");
    setCurrentPage(1); // Reseta a página
    // A busca será acionada pelo useEffect quando os estados de filtro mudarem para ""
  };

  const handleEdit = (produto: ProdutoListItem) => {
    navigation.navigate("ProductForm", { produtoParaEditarId: produto.produto_id });
  };

  const handleDelete = (produto: ProdutoListItem) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja desativar o produto "${produto.produto_nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desativar",
          style: "destructive",
          onPress: async () => {
            setLoading(true); // Pode usar um loading específico para a ação
            try {
              await produtoService.excluirProduto(produto.produto_id);
              Alert.alert("Sucesso", "Produto desativado!");
              fetchProdutos(1, false, true); // Recarrega da primeira página
            } catch (err: any) {
              const message = err.response?.data?.message || err.message || "Não foi possível desativar.";
              Alert.alert("Erro", message);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    )
  };

  const criarNovoProduto = () => {
    navigation.navigate("ProductForm");
  };

  const renderItem = ({ item }: { item: ProdutoListItem }) => (
    <View style={[productListStyles.produtoCard, item.ativo && !productListStyles.produtoInativo]}>
      <View style={productListStyles.produtoHeader}>
        <Text style={productListStyles.produtoNome} numberOfLines={2}>{item.produto_nome}</Text>
        <View style={productListStyles.produtoActions}>
          <TouchableOpacity style={productListStyles.actionButton} onPress={() => handleEdit(item)}>
            <Ionicons name="pencil-outline" size={22} color="#007bff" />
          </TouchableOpacity>
          {item.ativo && ( // Só mostra botão de desativar se estiver ativo
            <TouchableOpacity style={productListStyles.actionButton} onPress={() => handleDelete(item)}>
              <Ionicons name="trash-outline" size={22} color="#dc3545" />
            </TouchableOpacity>
          )}
          {/* Adicionar botão para REATIVAR se necessário */}
        </View>
      </View>
      <View style={productListStyles.produtoInfo}>
        <Text style={productListStyles.produtoPreco}>
          <Text style={productListStyles.infoLabel}>Preço: </Text>
          R$ {Number(item.produto_precoOriginal).toFixed(2)}
        </Text>
        <Text style={[
            productListStyles.produtoStatus,
            item.produto_status === 'APROVADO' && productListStyles.statusAprovado,
            item.produto_status === 'PENDENTE' && productListStyles.statusPendente,
            item.produto_status === 'REJEITADO' && productListStyles.statusRejeitado,
        ]}>
          <Text style={productListStyles.infoLabel}>Status: </Text>
          {item.produto_status} {!item.ativo && "(INATIVO)"}
        </Text>
        {item.categoria?.categoria_nome && (<Text style={productListStyles.produtoDetalhe}><Text style={productListStyles.infoLabel}>Cat: </Text>{item.categoria.categoria_nome}</Text>)}
        {item.marca?.marca_nome && (<Text style={productListStyles.produtoDetalhe}><Text style={productListStyles.infoLabel}>Marca: </Text>{item.marca.marca_nome}</Text>)}
        {item.tipo?.tipo_nome && (<Text style={productListStyles.produtoDetalhe}><Text style={productListStyles.infoLabel}>Tipo: </Text>{item.tipo.tipo_nome}</Text>)}
      </View>
    </View>
  );

  const renderListHeader = () => (
    <View style={productListStyles.filtersContainer}>
        <View style={productListStyles.searchContainer}>
          <TextInput
            style={productListStyles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nome do produto..."
            returnKeyType="search"
            onSubmitEditing={pesquisarProdutos} // Busca ao pressionar enter
          />
          <TouchableOpacity style={productListStyles.searchButton} onPress={pesquisarProdutos}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={productListStyles.pickerRow}>
            <View style={productListStyles.pickerWrapper}>
                <Picker
                    selectedValue={filtroStatusProduto}
                    onValueChange={(itemValue) => { setCurrentPage(1); setFiltroStatusProduto(itemValue as any);}}
                    style={productListStyles.picker}
                    prompt="Filtrar por Status do Produto"
                >
                    <Picker.Item label="Status (Todos)" value="" />
                    <Picker.Item label="Aprovado" value="APROVADO" />
                    <Picker.Item label="Pendente" value="PENDENTE" />
                    <Picker.Item label="Rejeitado" value="REJEITADO" />
                </Picker>
            </View>
            <View style={productListStyles.pickerWrapper}>
                <Picker
                    selectedValue={filtroAtivo}
                    onValueChange={(itemValue) => { setCurrentPage(1); setFiltroAtivo(itemValue as string);}}
                    style={productListStyles.picker}
                    prompt="Filtrar por Atividade"
                >
                    <Picker.Item label="Atividade (Todos)" value="" />
                    <Picker.Item label="Ativos" value="true" />
                    <Picker.Item label="Inativos" value="false" />
                </Picker>
            </View>
        </View>

        {(searchQuery || filtroAtivo !== "" || filtroStatusProduto !== "") && (
          <TouchableOpacity style={productListStyles.clearFiltersButton} onPress={limparFiltros}>
            <Ionicons name="close-circle-outline" size={22} color="#6c757d" />
            <Text style={productListStyles.clearFiltersText}>Limpar Filtros</Text>
          </TouchableOpacity>
        )}
      </View>
  );


  return (
    <View style={productListStyles.container}>
      <View style={productListStyles.header}>
        <Text style={productListStyles.title}>Gerenciar Produtos</Text>
        <TouchableOpacity style={productListStyles.addButton} onPress={criarNovoProduto}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={productListStyles.addButtonText}>Novo</Text>
        </TouchableOpacity>
      </View>

      {loading && produtos.length === 0 && !refreshing ? (
        <ActivityIndicator size="large" color="#007bff" style={productListStyles.centeredLoading} />
      ) : error && produtos.length === 0 ? (
        <View style={productListStyles.centeredMessageContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#dc3545" />
            <Text style={productListStyles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchProdutos(1, false, true)} style={productListStyles.retryButton}>
                <Text style={productListStyles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={produtos}
          renderItem={renderItem}
          keyExtractor={(item) => item.produto_id.toString()}
          ListHeaderComponent={renderListHeader} // Adiciona os filtros no topo
          contentContainerStyle={produtos.length === 0 ? productListStyles.emptyContainerCentralized : productListStyles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#007bff"]} />}
          ListEmptyComponent={
            !loading && !error ? (
              <View style={productListStyles.emptyContainer}>
                <Ionicons name="cube-outline" size={60} color="#adb5bd" />
                <Text style={productListStyles.emptyText}>Nenhum produto encontrado.</Text>
                <Text style={productListStyles.emptySubText}>Tente ajustar os filtros ou adicione um novo produto.</Text>
              </View>
            ) : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5} // Chama onEndReached quando estiver a 50% do final
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 20 }} color="#007bff"/> : null}
        />
      )}
    </View>
  )
}

export default ProductListScreen;
