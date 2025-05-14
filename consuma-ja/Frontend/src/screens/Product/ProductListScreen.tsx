// src/screens/Product/ProductListScreen.tsx
"use client"

import React, { useState, useCallback, useEffect } from "react" // Adicionado useEffect
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
  Platform, // Adicionado para estilo do Picker
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import produtoService from "../../services/produtoService" // Garanta que o caminho está correto
import { Picker } from '@react-native-picker/picker'; // Importar Picker

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
    <View style={[styles.produtoCard, item.ativo && !styles.produtoInativo]}>
      <View style={styles.produtoHeader}>
        <Text style={styles.produtoNome} numberOfLines={2}>{item.produto_nome}</Text>
        <View style={styles.produtoActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
            <Ionicons name="pencil-outline" size={22} color="#007bff" />
          </TouchableOpacity>
          {item.ativo && ( // Só mostra botão de desativar se estiver ativo
            <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
              <Ionicons name="trash-outline" size={22} color="#dc3545" />
            </TouchableOpacity>
          )}
          {/* Adicionar botão para REATIVAR se necessário */}
        </View>
      </View>
      <View style={styles.produtoInfo}>
        <Text style={styles.produtoPreco}>
          <Text style={styles.infoLabel}>Preço: </Text>
          R$ {Number(item.produto_precoOriginal).toFixed(2)}
        </Text>
        <Text style={[
            styles.produtoStatus,
            item.produto_status === 'APROVADO' && styles.statusAprovado,
            item.produto_status === 'PENDENTE' && styles.statusPendente,
            item.produto_status === 'REJEITADO' && styles.statusRejeitado,
        ]}>
          <Text style={styles.infoLabel}>Status: </Text>
          {item.produto_status} {!item.ativo && "(INATIVO)"}
        </Text>
        {item.categoria?.categoria_nome && (<Text style={styles.produtoDetalhe}><Text style={styles.infoLabel}>Cat: </Text>{item.categoria.categoria_nome}</Text>)}
        {item.marca?.marca_nome && (<Text style={styles.produtoDetalhe}><Text style={styles.infoLabel}>Marca: </Text>{item.marca.marca_nome}</Text>)}
        {item.tipo?.tipo_nome && (<Text style={styles.produtoDetalhe}><Text style={styles.infoLabel}>Tipo: </Text>{item.tipo.tipo_nome}</Text>)}
      </View>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nome do produto..."
            returnKeyType="search"
            onSubmitEditing={pesquisarProdutos} // Busca ao pressionar enter
          />
          <TouchableOpacity style={styles.searchButton} onPress={pesquisarProdutos}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.pickerRow}>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={filtroStatusProduto}
                    onValueChange={(itemValue) => { setCurrentPage(1); setFiltroStatusProduto(itemValue as any);}}
                    style={styles.picker}
                    prompt="Filtrar por Status do Produto"
                >
                    <Picker.Item label="Status (Todos)" value="" />
                    <Picker.Item label="Aprovado" value="APROVADO" />
                    <Picker.Item label="Pendente" value="PENDENTE" />
                    <Picker.Item label="Rejeitado" value="REJEITADO" />
                </Picker>
            </View>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={filtroAtivo}
                    onValueChange={(itemValue) => { setCurrentPage(1); setFiltroAtivo(itemValue as string);}}
                    style={styles.picker}
                    prompt="Filtrar por Atividade"
                >
                    <Picker.Item label="Atividade (Todos)" value="" />
                    <Picker.Item label="Ativos" value="true" />
                    <Picker.Item label="Inativos" value="false" />
                </Picker>
            </View>
        </View>

        {(searchQuery || filtroAtivo !== "" || filtroStatusProduto !== "") && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={limparFiltros}>
            <Ionicons name="close-circle-outline" size={22} color="#6c757d" />
            <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
          </TouchableOpacity>
        )}
      </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Produtos</Text>
        <TouchableOpacity style={styles.addButton} onPress={criarNovoProduto}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addButtonText}>Novo</Text>
        </TouchableOpacity>
      </View>

      {loading && produtos.length === 0 && !refreshing ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.centeredLoading} />
      ) : error && produtos.length === 0 ? (
        <View style={styles.centeredMessageContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#dc3545" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchProdutos(1, false, true)} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={produtos}
          renderItem={renderItem}
          keyExtractor={(item) => item.produto_id.toString()}
          ListHeaderComponent={renderListHeader} // Adiciona os filtros no topo
          contentContainerStyle={produtos.length === 0 ? styles.emptyContainerCentralized : styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#007bff"]} />}
          ListEmptyComponent={
            !loading && !error ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={60} color="#adb5bd" />
                <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
                <Text style={styles.emptySubText}>Tente ajustar os filtros ou adicione um novo produto.</Text>
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

// <<< ESTILOS COMPLETOS E CORRIGIDOS >>>
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Cor de fundo geral da tela
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12, // Ajustado
    backgroundColor: "#fff", // Fundo branco para o header
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0", // Linha sutil
  },
  title: {
    fontSize: 20, // Ajustado
    fontWeight: "bold",
    color: "#343a40",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745", // Verde para adicionar
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6, // Bordas mais suaves
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 6,
    fontSize: 14,
  },
  filtersContainer: {
    padding: 12, // Padding ajustado
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 0, // Remover margem se a FlatList tiver paddingTop
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 12, // Espaço abaixo da busca
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f1f3f5", // Fundo suave para input
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8, // Ajuste de padding para altura
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#495057',
  },
  searchButton: {
    backgroundColor: "#007bff", // Azul para busca
    paddingHorizontal: 12, // Ajustado
    borderRadius: 6,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    // height: 44, // Altura definida pelo padding do input
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center', // Para alinhar o Picker no Android
    height: 44, // Altura consistente
  },
  pickerWrapperMargin: { // Adiciona margem se houver mais de um picker na linha
    marginRight: 8,
  },
  picker: {
    height: 44, // Altura consistente
    width: '100%',
    // No Android, o Picker dentro de uma View com altura pode precisar de ajustes
    // ou usar um componente de Picker customizado para melhor estilo.
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  clearFiltersText: {
    color: "#6c757d", // Cinza mais escuro
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 12, // Padding para os cards
    paddingTop: 10, // Espaço acima do primeiro card
    paddingBottom: 20, // Espaço abaixo do último card
  },
  produtoCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15, // Padding interno do card
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef", // Borda mais suave
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  produtoInativo: {
    opacity: 0.6,
    backgroundColor: '#f8f9fa', // Fundo diferente para inativos
  },
  produtoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Alinha ao topo para nomes longos
    marginBottom: 10,
  },
  produtoNome: {
    fontSize: 17, // Ajustado
    fontWeight: "600", // Um pouco menos bold
    color: "#343a40",
    flex: 1, // Para permitir quebra de linha e ocupar espaço
    marginRight: 10,
  },
  produtoActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 6, // Área de toque maior
    marginLeft: 10, // Espaço entre botões
  },
  produtoInfo: {
    borderTopWidth: 1,
    borderTopColor: "#f1f3f5", // Linha divisória mais suave
    paddingTop: 10,
  },
  infoLabel: {
    fontWeight: "500",
    color: "#495057",
  },
  produtoPreco: {
    fontSize: 15,
    color: "#28a745", // Verde para preço
    fontWeight: 'bold',
    marginBottom: 5,
  },
  produtoStatus: {
    fontSize: 13,
    color: "#6c757d",
    marginBottom: 3,
    textTransform: "capitalize",
  },
  statusAprovado: { color: 'green' },
  statusPendente: { color: '#ffc107' },
  statusRejeitado: { color: '#dc3545' },
  produtoDetalhe: { // Estilo genérico para Categoria, Marca, Tipo
    fontSize: 13,
    color: "#6c757d",
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1, // Para ocupar espaço se a lista estiver vazia mas o header estiver presente
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyContainerCentralized: { // Usado quando a lista é o único conteúdo
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center'
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
  emptySubText: {
      fontSize: 14,
      color: "#adb5bd",
      textAlign: "center",
      marginTop: 4,
  },
  loadingOverlay: { // Para loading de ações como delete
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)", // Overlay mais suave
  },
  centeredLoading: { // Para o loading inicial da tela inteira
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  retryButton: {
      marginTop: 20,
      backgroundColor: '#007bff',
      paddingVertical: 10,
      paddingHorizontal: 25,
      borderRadius: 5,
  },
  retryButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '500',
  }
});
// ---------------------------------------

export default ProductListScreen;
