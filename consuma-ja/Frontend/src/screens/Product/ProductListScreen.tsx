import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import produtoService from '../../services/produtoService'; // Importar o serviço
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Tipagem (opcional)

// Definir tipo para o item Produto (simplificado para a lista)
interface ProdutoListItem {
    produto_id: number;
    produto_nome: string;
    produto_status: string; // 'APROVADO', 'PENDENTE', 'REJEITADO'
    produto_precoOriginal: number;
    ativo: boolean;
    // Poderia incluir nome da categoria/marca/tipo se a API retornar
    categoria?: { categoria_nome?: string } | null;
    marca?: { marca_nome?: string } | null;
    tipo?: { tipo_nome?: string } | null;
}

// Tipagem da Navegação (opcional)
// type ProductStackParamList = {
//   ProductList: undefined; // Renomeado para ProductList
//   ProductForm: { produtoParaEditar?: ProdutoListItem }; // Passa item simplificado
// };
// type ProductListNavigationProp = NativeStackNavigationProp<ProductStackParamList, 'ProductList'>;

// Componente Item da Lista
const ProductListItem = ({ item, onEdit, onDelete }: { item: ProdutoListItem, onEdit: (item: ProdutoListItem) => void, onDelete: (item: ProdutoListItem) => void }) => (
  <View style={[styles.listItem, !item.ativo ? styles.listItemInactive : null]}>
    <View style={styles.listItemText}>
        <Text style={styles.itemTextTitle}>{item.produto_id} - {item.produto_nome}</Text>
        <Text style={styles.itemText}>Status: {item.produto_status} {item.ativo ? '' : '(Inativo)'}</Text>
        <Text style={styles.itemText}>Preço: R$ {item.produto_precoOriginal?.toFixed(2)}</Text>
        {/* Mostrar Categoria/Marca/Tipo se disponíveis */}
        {item.categoria?.categoria_nome && <Text style={styles.itemSubText}>Categoria: {item.categoria.categoria_nome}</Text>}
        {item.marca?.marca_nome && <Text style={styles.itemSubText}>Marca: {item.marca.marca_nome}</Text>}
    </View>
    <View style={styles.listItemButtons}>
        <TouchableOpacity onPress={() => onEdit(item)} style={[styles.button, styles.editButton]}>
            <Text style={styles.buttonTextSmall}>Editar</Text>
        </TouchableOpacity>
        {/* Só permite excluir (desativar) se estiver ativo */}
        {item.ativo && (
            <TouchableOpacity onPress={() => onDelete(item)} style={[styles.button, styles.deleteButton]}>
                 <Text style={styles.buttonTextSmall}>Excluir</Text>
            </TouchableOpacity>
        )}
    </View>
  </View>
);

const ProductListScreen = () => {
  const navigation = useNavigation<any>(); // Usar tipo correto se definido

  const [produtos, setProdutos] = useState<ProdutoListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProdutos = async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      // Service deve retornar um array, mesmo em caso de erro interno do service
      const data = await produtoService.listarProdutos(); // Por padrão lista ativos
      setProdutos(data || []);
    } catch (err) {
      console.error("Erro ao buscar produtos (Tela):", err);
      setError("Não foi possível carregar os produtos.");
      setProdutos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchProdutos(); }, []));

  const handleRefresh = () => { setRefreshing(true); fetchProdutos(); };

  const handleEdit = (produto: ProdutoListItem) => {
    // Navega para form passando dados para edição
    // Importante: Passar o ID correto para buscar o objeto completo na tela de form se necessário
    navigation.navigate('ProductForm', { produtoParaEditarId: produto.produto_id });
  };

  const handleDelete = (produto: ProdutoListItem) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir (desativar) o produto "${produto.produto_nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            setLoading(true);
            try {
                 await produtoService.excluirProduto(produto.produto_id);
                 Alert.alert("Sucesso", "Produto desativado com sucesso!");
                 fetchProdutos(); // Recarrega
            } catch (err: any) {
                 console.error("Erro ao excluir produto:", err);
                 const message = err.response?.data?.message || err.message || "Não foi possível excluir o produto.";
                 Alert.alert("Erro", message);
            } finally {
                 setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderContent = () => {
    if (loading && !refreshing) { return <ActivityIndicator size="large" color="#0066cc" style={styles.centered}/>; }
    if (error) { return <Text style={[styles.centered, styles.errorText]}>{error}</Text>; }
    if (produtos.length === 0 && !loading) { return <Text style={styles.centered}>Nenhum produto encontrado.</Text>; }

    return (
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.produto_id.toString()}
        renderItem={({ item }) => (
          <ProductListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#0066cc"]}/>}
      />
    );
  };

  return (
    <View style={styles.container}>
       <TouchableOpacity
         style={[styles.button, styles.addButton]}
         onPress={() => navigation.navigate('ProductForm')} // Modo criação
       >
         <Text style={styles.buttonText}>Adicionar Novo Produto</Text>
       </TouchableOpacity>
      {renderContent()}
       {loading && !refreshing && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
    </View>
  );
};

// Estilos (Adapte de outras ListScreen)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    list: { padding: 10, },
    listItem: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
    listItemInactive: { backgroundColor: '#e9ecef', opacity: 0.7 }, // Estilo para inativos
    listItemText: { flex: 1, marginRight: 10 },
    listItemButtons: { flexDirection: 'row' },
    itemTextTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
    itemText: { fontSize: 14, marginBottom: 2 },
    itemSubText: { fontSize: 12, color: 'grey' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 20 },
    errorText: { color: 'red', fontSize: 16 },
    button: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, marginLeft: 5, justifyContent: 'center', alignItems: 'center' },
    editButton: { backgroundColor: '#ffc107' },
    deleteButton: { backgroundColor: '#dc3545' },
    addButton: { backgroundColor: '#28a745', margin: 10, padding: 15, alignSelf: 'stretch', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    buttonTextSmall: { color: 'white', fontSize: 12 },
    loadingOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }
});

export default ProductListScreen;