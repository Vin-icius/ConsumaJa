import React, { useState, useEffect, useCallback } from 'react';
// <<< Adicionar StyleSheet >>>
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import promocaoService from '../../services/promocaoService';
import { Ionicons } from '@expo/vector-icons';

// Tipos locais para esta tela (podem espelhar ou simplificar os do backend)
interface ProdutoInfoParaDetalhe {
    produto_id: number;
    produto_nome: string;
    produto_medida: string;
    produto_precoOriginal?: number;
    produto_imagem_url?: string | null;
    categoria?: { categoria_id?: number; categoria_nome?: string } | null; // Adicionado categoria_id opcional
    marca?: { marca_id?: number; marca_nome?: string } | null; // Adicionado marca_id opcional
    tipo?: { tipo_id?: number; tipo_nome?: string } | null; // Adicionado tipo_id opcional
}
interface LoteInfoParaDetalhe {
    lote_id: number;
    lote_codigo: string;
    lote_validade: string;
    lote_quantidade_atual: number;
}
interface ItemPromocaoParaDetalhe {
    LOTEPROD_lote_id: number;
    itemPromocao_qtde: number;
    itemPromocao_valor: number;
    produto: ProdutoInfoParaDetalhe;
    lote: LoteInfoParaDetalhe;
}
interface PromocaoDetalhada {
  promocao_id: number;
  promocao_descricao?: string | null;
  fornecedor: { pessoa_id: number; pessoa_nome: string; };
  itens: ItemPromocaoParaDetalhe[];
  inicio: string | Date; // Adicionado
  fim: string | Date | null; // Adicionado
}

const PromocaoDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>(); // Adicionado para setOptions
  const { promocaoId } = route.params;

  const [promocao, setPromocao] = useState<PromocaoDetalhada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<ItemPromocaoParaDetalhe[]>([]); // Manter cart local

  const fetchDetalhes = useCallback(async () => {
    if (!promocaoId) { setError("ID da promoção não fornecido."); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      console.log(`[PromocaoDetailScreen] Buscando detalhes para promocao ID: ${promocaoId}`);
      const data = await promocaoService.getPromocaoDetalhes(promocaoId);
      console.log("[PromocaoDetailScreen] Detalhes recebidos:", data);
      if (data) {
        setPromocao(data);
        const screenTitle = data.promocao_descricao || data.fornecedor?.pessoa_nome || 'Detalhes da Promoção';
        navigation.setOptions({ title: screenTitle });
      } else {
        setError("Promoção não encontrada.");
      }
    } catch (err: any) {
        console.error("Erro ao buscar detalhes da promoção:", err.response?.data || err.message || err);
        setError("Não foi possível carregar os detalhes da promoção.");
    } finally { setLoading(false); }
  }, [promocaoId, navigation]);

  useEffect(() => { fetchDetalhes(); }, [fetchDetalhes]);

  const addToCart = (item: ItemPromocaoParaDetalhe) => {
    if (item.lote.lote_quantidade_atual <= 0) { Alert.alert("Indisponível", "Este item do lote está esgotado."); return; }
    setCart(prevCart => [...prevCart, item]);
    Alert.alert("Adicionado!", `${item.produto.produto_nome} adicionado ao carrinho.`);
  };

  const renderProductItem = ({ item }: { item: ItemPromocaoParaDetalhe }) => {
    const nomeCompleto = `${item.produto.produto_nome}${item.produto.marca?.marca_nome ? `, ${item.produto.marca.marca_nome}` : ''}${item.produto.categoria?.categoria_nome ? `, ${item.produto.categoria.categoria_nome}` : ''}${item.produto.tipo?.tipo_nome ? `, ${item.produto.tipo.tipo_nome}` : ''}`;
    const validadeString = item.lote.lote_validade ? new Date(item.lote.lote_validade).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';

    return (
        <View style={styles.productItem}>
          <Image
            source={item.produto.produto_imagem_url ? { uri: item.produto.produto_imagem_url } : require('../../assets/placeholder.png')}
            style={styles.productImage}
            resizeMode="contain"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{nomeCompleto}</Text>
            <Text style={styles.productMeasure}>Medida: {item.produto.produto_medida || 'N/A'}</Text>
            {item.produto.produto_precoOriginal != null && (
                <Text style={styles.originalPrice}>De: R$ {Number(item.produto.produto_precoOriginal).toFixed(2)}</Text>
            )}
            <Text style={styles.promoPrice}>Por: R$ {Number(item.itemPromocao_valor).toFixed(2)}</Text>
            <Text style={styles.productStock}>Disponível (lote): {item.lote.lote_quantidade_atual} / Ofertado (promo): {item.itemPromocao_qtde}</Text>
            <Text style={styles.productValidity}>Validade Lote: {validadeString}</Text>
          </View>
          <TouchableOpacity
            style={[styles.addToCartButton, item.lote.lote_quantidade_atual <= 0 && styles.disabledButton]}
            onPress={() => addToCart(item)}
            disabled={item.lote.lote_quantidade_atual <= 0}
          >
            <Ionicons name="cart-outline" size={20} color="white" />
            <Text style={styles.addToCartButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#007bff" style={styles.centered} />;
  if (error) return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={fetchDetalhes}><Text style={styles.retryText}>Tentar Novamente</Text></TouchableOpacity></View>;
  if (!promocao) return <Text style={styles.centered}>Promoção não encontrada ou dados inválidos.</Text>;

  return (
    <FlatList
        ListHeaderComponent={
            <View style={styles.header}>
                <Text style={styles.promotionTitle}>{promocao.promocao_descricao || 'Detalhes da Promoção'}</Text>
                <Text style={styles.supplierName}>Oferecida por: {promocao.fornecedor.pessoa_nome}</Text>
                <Text style={styles.dateInfo}>
                    Válida de: {new Date(promocao.inicio).toLocaleDateString('pt-BR')}
                    {promocao.fim ? ` até ${new Date(promocao.fim).toLocaleDateString('pt-BR')}` : ' (tempo indeterminado)'}
                </Text>
            </View>
        }
        data={promocao.itens}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => {
            const pId = item.produto?.produto_id ?? `p_idx_${index}`;
            const lId = item.lote?.lote_id ?? `l_idx_${index}`;
            return `${pId}-${lId}`;
        }}
        contentContainerStyle={styles.container}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto nesta promoção.</Text>}
    />
  );
};

// <<< DEFINIÇÃO COMPLETA DOS ESTILOS >>>
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', paddingVertical: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  retryText: { color: '#007bff', fontSize: 16, marginTop: 10},
  header: { paddingHorizontal: 15, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15 },
  promotionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5, textAlign: 'center' },
  supplierName: { fontSize: 16, color: 'grey', textAlign: 'center', marginBottom: 5 },
  dateInfo: { fontSize: 14, color: 'grey', textAlign: 'center', marginBottom: 10 },
  productItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  productImage: { width: 80, height: 80, borderRadius: 6, marginRight: 15, backgroundColor: '#f0f0f0' },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 4 },
  productMeasure: { fontSize: 13, color: 'grey', marginBottom: 3 },
  originalPrice: { fontSize: 12, textDecorationLine: 'line-through', color: '#aaa', marginBottom: 1 },
  promoPrice: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginBottom: 4 },
  productStock: { fontSize: 12, color: '#555', marginBottom: 2 },
  productValidity: { fontSize: 12, color: '#555' },
  addToCartButton: { flexDirection: 'row', backgroundColor: '#007bff', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 5, alignItems: 'center', justifyContent: 'center', minWidth: 100, alignSelf: 'flex-end' },
  addToCartButtonText: { color: 'white', fontSize: 13, fontWeight: 'bold', marginLeft: 5 },
  disabledButton: { backgroundColor: '#ced4da' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'grey' },
});
// ---------------------------------------

export default PromocaoDetailScreen;