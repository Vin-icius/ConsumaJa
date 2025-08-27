// src/screens/Product/AprovacaoListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import produtoService from '../../services/produtoService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// <<< ADICIONAR IMPORT DO IONICONS >>>
import { Ionicons } from '@expo/vector-icons';
import { aprovacaoListStyles } from '../../common/styles/Product/aprovacaoListScreen.styled';
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
  <TouchableOpacity style={aprovacaoListStyles.listItem} onPress={() => onSelect(item)}>
    <View style={aprovacaoListStyles.listItemText}>
        <Text style={aprovacaoListStyles.itemTextTitle}>{item.produto_id} - {item.produto_nome}</Text>
        {item.categoria?.categoria_nome && <Text style={aprovacaoListStyles.itemSubText}>Categoria: {item.categoria.categoria_nome}</Text>}
        {item.data_registro && <Text style={aprovacaoListStyles.itemSubText}>Registrado em: {new Date(item.data_registro).toLocaleDateString()}</Text>}
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
    if (loading && !refreshing) { return <ActivityIndicator size="large" color="#0066cc" style={aprovacaoListStyles.centered}/>; }
    if (error) { return <Text style={[aprovacaoListStyles.centered, aprovacaoListStyles.errorText]}>{error}</Text>; }
    if (produtosPendentes.length === 0 && !loading) { return <Text style={aprovacaoListStyles.centered}>Nenhum produto pendente.</Text>; }

    return (
      <FlatList
        data={produtosPendentes}
        keyExtractor={(item) => item.produto_id.toString()}
        renderItem={({ item }) => (
          <AprovacaoListItem item={item} onSelect={handleSelectProduto} />
        )}
        contentContainerStyle={aprovacaoListStyles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#0066cc"]}/>}
      />
    );
  };

  return (
    <View style={aprovacaoListStyles.container}>
      {renderContent()}
    </View>
  );
};

export default AprovacaoListScreen;