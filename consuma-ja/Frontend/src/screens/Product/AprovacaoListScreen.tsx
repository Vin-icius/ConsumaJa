// src/screens/Product/AprovacaoListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import produtoService from '../../services/produtoService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// <<< ADICIONAR IMPORT DO IONICONS >>>
import { Ionicons } from '@expo/vector-icons';
// ----------------------------------

// Tipo para o item Produto
interface ProdutoPendenteItem {
    produto_id: number;
    produto_nome: string;
    categoria?: { categoria_nome?: string } | null;
    data_registro?: Date | string;
}

// Componente Item da Lista
// Adicionado Ionicons importado
const AprovacaoListItem = ({ item, onSelect }: { item: ProdutoPendenteItem, onSelect: (item: ProdutoPendenteItem) => void }) => (
  <TouchableOpacity style={styles.listItem} onPress={() => onSelect(item)}>
    <View style={styles.listItemText}>
        <Text style={styles.itemTextTitle}>{item.produto_id} - {item.produto_nome}</Text>
        {item.categoria?.categoria_nome && <Text style={styles.itemSubText}>Categoria: {item.categoria.categoria_nome}</Text>}
        {item.data_registro && <Text style={styles.itemSubText}>Registrado em: {new Date(item.data_registro).toLocaleDateString()}</Text>}
    </View>
    {/* Agora Ionicons está definido */}
    <Ionicons name="chevron-forward-outline" size={24} color="grey" />
  </TouchableOpacity>
);

const AprovacaoListScreen = () => {
  const navigation = useNavigation<any>();

  const [produtosPendentes, setProdutosPendentes] = useState<ProdutoPendenteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendentes = async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      const data = await produtoService.listarProdutosPendentes();
      setProdutosPendentes(data || []);
    } catch (err) {
      console.error("Erro ao buscar produtos pendentes (Tela):", err);
      setError("Não foi possível carregar os produtos pendentes.");
      setProdutosPendentes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPendentes(); }, []));

  const handleRefresh = () => { setRefreshing(true); fetchPendentes(); };

  const handleSelectProduto = (produto: ProdutoPendenteItem) => {
    navigation.navigate('AprovacaoDetail', { produtoId: produto.produto_id });
  };

  const renderContent = () => {
    if (loading && !refreshing) { return <ActivityIndicator size="large" color="#0066cc" style={styles.centered}/>; }
    if (error) { return <Text style={[styles.centered, styles.errorText]}>{error}</Text>; }
    if (produtosPendentes.length === 0 && !loading) { return <Text style={styles.centered}>Nenhum produto pendente.</Text>; }

    return (
      <FlatList
        data={produtosPendentes}
        keyExtractor={(item) => item.produto_id.toString()}
        renderItem={({ item }) => (
          <AprovacaoListItem item={item} onSelect={handleSelectProduto} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#0066cc"]}/>}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
};

// Estilos (mantidos)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    list: { padding: 10, },
    listItem: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
    listItemText: { flex: 1, marginRight: 10 },
    itemTextTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
    itemText: { fontSize: 14, marginBottom: 2 },
    itemSubText: { fontSize: 12, color: 'grey' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 20 },
    errorText: { color: 'red', fontSize: 16 },
});


export default AprovacaoListScreen;