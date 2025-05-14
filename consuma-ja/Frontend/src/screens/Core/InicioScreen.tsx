import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import promocaoService from '../../services/promocaoService';
import categoriaService from '../../services/categoriaService'; // Para o filtro de categorias
import PromocaoCard from '../../components/Promotions/PromocaoCard'; // Importa o Card

// Tipos (ajuste conforme necessário)
interface Promocao {
  promocao_id: number;
  promocao_descricao?: string;
  fornecedor: { pessoa_id: number; pessoa_nome: string; };
  itens_preview: Array<{ produto_id: number; produto_nome: string; itemPromocao_valor: number; imagem_url?: string; }>;
}
interface CategoriaItem { categoria_id: number; categoria_nome: string; }

const InicioScreen = () => {
  const navigation = useNavigation<any>(); // Tipar se tiver param list

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'produto' | 'fornecedor'>('produto'); // Default
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [categoriasFiltro, setCategoriasFiltro] = useState<CategoriaItem[]>([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | undefined>(undefined);

  // --- Buscar Dados ---
  const fetchPromocoes = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (searchQuery.trim()) {
        params.searchTerm = searchQuery.trim();
        params.searchType = searchType;
      }
      if (selectedCategoriaId) {
        params.categoriaId = selectedCategoriaId;
      }
      console.log("[InicioScreen] Buscando promoções com params:", params);
      const data = await promocaoService.listarPromocoes(params);
      setPromocoes(data || []);
    } catch (err) {
      console.error("Erro ao buscar promoções:", err);
      setError("Não foi possível carregar as promoções.");
      setPromocoes([]);
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  }, [searchQuery, searchType, selectedCategoriaId]);

  const fetchCategoriasParaFiltro = async () => {
      try {
          const data = await categoriaService.listarCategorias();
          setCategoriasFiltro([{ categoria_id: 0, categoria_nome: 'Todas as Categorias' }, ...(data || [])]); // Adiciona "Todas"
      } catch (error) {
          console.error("Erro ao buscar categorias para filtro:", error);
          // Pode mostrar um alerta ou tratar silenciosamente
      }
  };

  // Busca inicial e ao focar
  useFocusEffect(
    useCallback(() => {
      fetchPromocoes();
      if (categoriasFiltro.length <= 1) { // Busca categorias só uma vez ou se estiver vazio (além do "Todas")
          fetchCategoriasParaFiltro();
      }
    }, []) // Executa apenas na primeira vez que foca, ou se dependências mudarem
  );

  const handleSearchSubmit = () => {
      Keyboard.dismiss(); // Esconde teclado
      fetchPromocoes();
  };

  const handleApplyFilters = () => {
      fetchPromocoes();
      setFilterModalVisible(false);
  };

  const openPromotionDetails = (promocaoId: number) => {
      navigation.navigate('PromocaoDetail', { promocaoId: promocaoId });
  };


  // --- Renderização ---
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBarContainer}>
            <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchBar}
              placeholder={`Buscar por ${searchType === 'produto' ? 'produto' : 'fornecedor'}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit} // Busca ao pressionar enter/done
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); fetchPromocoes(); /* Refaz busca sem termo */ }} style={styles.clearSearchIcon}>
                    <Ionicons name="close-circle" size={20} color="#aaa" />
                </TouchableOpacity>
            )}
        </View>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#007bff" style={styles.centered} />;
  if (error) return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => fetchPromocoes()}><Text style={styles.retryText}>Tentar Novamente</Text></TouchableOpacity></View>;

  return (
    <View style={styles.container}>
      {/* O header do DrawerNavigator já mostra o título "Início", não precisa repetir aqui */}
      <FlatList
        data={promocoes}
        keyExtractor={(item) => item.promocao_id.toString()}
        renderItem={({ item }) => (
          <PromocaoCard
            {...item}
            onPressDetalhes={() => openPromotionDetails(item.promocao_id)}
          />
        )}
        numColumns={2} // Define duas colunas
        // Opcional: para estilizar a "linha" que contém as duas colunas
        columnWrapperStyle={styles.row}
        // --------------------------------
        ListHeaderComponent={renderHeader} // Barra de busca e filtro no topo
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma promoção encontrada com os filtros atuais.</Text>}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchPromocoes.bind(null, true)} // Passa true para isRefreshing
        refreshing={loading && promocoes.length > 0} // Mostra indicador de refresh se carregando E já tem itens
      />

      {/* Modal de Filtro */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)} activeOpacity={1}>
            <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={Keyboard.dismiss}>
                <Text style={styles.modalTitle}>Filtros</Text>

                <Text style={styles.modalLabel}>Buscar em:</Text>
                <View style={styles.pickerContainerModal}>
                    <Picker selectedValue={searchType} onValueChange={(itemValue) => setSearchType(itemValue)} style={styles.pickerStyle} >
                        <Picker.Item label="Nome do Produto" value="produto" />
                        <Picker.Item label="Nome do Fornecedor" value="fornecedor" />
                    </Picker>
                </View>

                <Text style={styles.modalLabel}>Categoria:</Text>
                <View style={styles.pickerContainerModal}>
                    <Picker selectedValue={selectedCategoriaId} onValueChange={(itemValue) => setSelectedCategoriaId(itemValue)} style={styles.pickerStyle}>
                         {/* Picker.Item com value 0 ou undefined para "Todas" */}
                        {categoriasFiltro.map(cat => (
                            <Picker.Item key={cat.categoria_id} label={cat.categoria_nome} value={cat.categoria_id === 0 ? undefined : cat.categoria_id} />
                        ))}
                    </Picker>
                </View>

                <TouchableOpacity style={styles.applyFilterButton} onPress={handleApplyFilters}>
                    <Text style={styles.applyFilterButtonText}>Aplicar Filtros</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeFilterButton} onPress={() => setFilterModalVisible(false)}>
                    <Text style={styles.closeFilterButtonText}>Fechar</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Estilos (Adapte conforme necessário)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' }, // Fundo mais suave
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  retryText: { color: '#007bff', fontSize: 16, marginTop: 10},
  headerContainer: { paddingHorizontal: 10, paddingTop: 10, backgroundColor: '#f0f0f0' },
  searchFilterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, },
  searchBarContainer: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      backgroundColor: 'white', borderRadius: 8,
      paddingHorizontal: 10, height: 44, elevation: 2,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, shadowRadius: 2,
  },
  searchIcon: { marginRight: 8, },
  searchBar: { flex: 1, height: '100%', fontSize: 15, },
  clearSearchIcon: { padding: 5, },
  filterButton: { padding: 10, marginLeft: 8, backgroundColor: 'white', borderRadius: 8, elevation: 2, height: 44, justifyContent: 'center' },
  listContent: { paddingHorizontal: 10, paddingBottom: 10, },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'grey' },
  // --- Modal Styles ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, elevation: 5, maxHeight: '70%', // Limita altura do modal
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 16, color: '#333', marginBottom: 8, marginTop: 10 },
  pickerContainerModal: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15, },
  pickerStyle: { height: 50, width: '100%', },
  applyFilterButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  applyFilterButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  closeFilterButton: { padding: 10, alignItems: 'center'},
  closeFilterButtonText: { color: '#007bff', fontSize: 15 },
  row: {
    justifyContent: 'space-between', // Distribui espaço entre os dois cards
    marginBottom: 16, // Espaço vertical ENTRE as linhas de cards
    }
});

export default InicioScreen;