import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import promocaoService from '../../services/promocaoService';
import { Ionicons } from '@expo/vector-icons';
import { promotionDetailStyles } from '../../common/styles/Promotions/promotionDetailScreen.styled';
import { useCart } from '../../contexts/CartContext/cartContext';
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

const PromotionDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>(); // Adicionado para setOptions
  const { promocaoId } = route.params;

  const [promocao, setPromocao] = useState<PromocaoDetalhada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Estados para o modal de quantidade
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemPromocaoParaDetalhe | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const { addToCart: addToCartContext } = useCart();

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

  const openQuantityModal = (item: ItemPromocaoParaDetalhe) => {
    setSelectedItem(item);
    setSelectedQuantity(1);
    setQuantityModalVisible(true);
  };

  const closeQuantityModal = () => {
    setQuantityModalVisible(false);
    setSelectedItem(null);
    setSelectedQuantity(1);
  };

  const confirmAddToCart = async () => {
    if (!selectedItem) {
      return;
    }

    const estoqueDisponivel = Math.min(
      selectedItem.lote.lote_quantidade_atual,
      selectedItem.itemPromocao_qtde,
    );
    const quantidadeEscolhida = Math.max(1, Math.min(selectedQuantity, estoqueDisponivel));

    try {
      await addToCartContext({
        produtoId: selectedItem.produto.produto_id,
        loteId: selectedItem.LOTEPROD_lote_id,
        promocaoId: promocao?.promocao_id ?? null,
        quantidade: quantidadeEscolhida,
      });

      Alert.alert(
        'Sucesso!',
        `${selectedItem.produto.produto_nome} adicionado ao carrinho (${quantidadeEscolhida} unidade${quantidadeEscolhida > 1 ? 's' : ''}).`,
      );
      closeQuantityModal();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Não foi possível adicionar ao carrinho.';
      Alert.alert('Erro', message);
    }
  };

  const renderProductItem = ({ item }: { item: ItemPromocaoParaDetalhe }) => {
    const nomeCompleto = `${item.produto.produto_nome}${item.produto.marca?.marca_nome ? `, ${item.produto.marca.marca_nome}` : ''}${item.produto.categoria?.categoria_nome ? `, ${item.produto.categoria.categoria_nome}` : ''}${item.produto.tipo?.tipo_nome ? `, ${item.produto.tipo.tipo_nome}` : ''}`;
    const validadeString = item.lote.lote_validade ? new Date(item.lote.lote_validade).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
    const loteDisponivel = Math.max(0, item.lote.lote_quantidade_atual);
    const ofertado = Math.max(0, item.itemPromocao_qtde);
    const saldoDisponivel = Math.min(loteDisponivel, ofertado || loteDisponivel);
    const disponibilidadeLote = `${loteDisponivel} un`;
    const disponibilidadePromo = `${ofertado} un`;
    const disponibilidadeTotal = `${saldoDisponivel} un`;

    return (
      <View style={promotionDetailStyles.productItem}>
        <View style={promotionDetailStyles.productHeaderRow}>
          <Image
            source={item.produto.produto_imagem_url ? { uri: item.produto.produto_imagem_url } : require('../../assets/placeholder.png')}
            style={promotionDetailStyles.productImage}
            resizeMode="contain"
          />

          <View style={promotionDetailStyles.productInfo}>
            <Text style={promotionDetailStyles.productName}>{nomeCompleto}</Text>
            <Text style={promotionDetailStyles.productMeasure}>Medida: {item.produto.produto_medida || 'N/A'}</Text>

            <View style={promotionDetailStyles.infoChipsRow}>
              {item.produto.marca?.marca_nome && (
                <Text style={promotionDetailStyles.infoChip}>Marca: {item.produto.marca.marca_nome}</Text>
              )}
              {item.produto.categoria?.categoria_nome && (
                <Text style={promotionDetailStyles.infoChip}>Categoria: {item.produto.categoria.categoria_nome}</Text>
              )}
              {item.produto.tipo?.tipo_nome && (
                <Text style={promotionDetailStyles.infoChip}>Tipo: {item.produto.tipo.tipo_nome}</Text>
              )}
            </View>

            {item.produto.produto_precoOriginal != null && (
              <Text style={promotionDetailStyles.originalPrice}>
                De: R$ {Number(item.produto.produto_precoOriginal).toFixed(2)}
              </Text>
            )}
          </View>
        </View>

        <View style={promotionDetailStyles.productStatsRow}>
          <View style={promotionDetailStyles.statBubble}>
            <Text style={promotionDetailStyles.statLabel}>Lote disponível</Text>
            <Text style={promotionDetailStyles.statValue}>{disponibilidadeLote}</Text>
          </View>
          <View style={promotionDetailStyles.statBubble}>
            <Text style={promotionDetailStyles.statLabel}>Ofertado na promoção</Text>
            <Text style={promotionDetailStyles.statValue}>{disponibilidadePromo}</Text>
          </View>
          <View style={promotionDetailStyles.statBubble}>
            <Text style={promotionDetailStyles.statLabel}>Restante</Text>
            <Text style={promotionDetailStyles.statValue}>{disponibilidadeTotal}</Text>
          </View>
          <View style={promotionDetailStyles.statBubble}>
            <Text style={promotionDetailStyles.statLabel}>Validade</Text>
            <Text style={promotionDetailStyles.statValue}>{validadeString}</Text>
          </View>
        </View>

        <View style={promotionDetailStyles.productFooterRow}>
          <View style={promotionDetailStyles.priceGroup}>
            <Text style={promotionDetailStyles.priceLabel}>Preço promocional</Text>
            <Text style={promotionDetailStyles.promoPrice}>R$ {Number(item.itemPromocao_valor).toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[promotionDetailStyles.addToCartButton, item.lote.lote_quantidade_atual <= 0 && promotionDetailStyles.disabledButton]}
            onPress={() => openQuantityModal(item)}
            disabled={item.lote.lote_quantidade_atual <= 0}
          >
            <Ionicons name="cart-outline" size={20} color="white" />
            <Text style={promotionDetailStyles.addToCartButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#007bff" style={promotionDetailStyles.centered} />;
  if (error) return <View style={promotionDetailStyles.centered}><Text style={promotionDetailStyles.errorText}>{error}</Text><TouchableOpacity onPress={fetchDetalhes}><Text style={promotionDetailStyles.retryText}>Tentar Novamente</Text></TouchableOpacity></View>;
  if (!promocao) return <Text style={promotionDetailStyles.centered}>Promoção não encontrada ou dados inválidos.</Text>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
          ListHeaderComponent={
              <View style={promotionDetailStyles.header}>
                  <Text style={promotionDetailStyles.promotionTitle}>{promocao.promocao_descricao || 'Detalhes da Promoção'}</Text>
                  <Text style={promotionDetailStyles.supplierName}>Oferecida por: {promocao.fornecedor.pessoa_nome}</Text>
                  <Text style={promotionDetailStyles.dateInfo}>
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
          contentContainerStyle={promotionDetailStyles.container}
          ListEmptyComponent={<Text style={promotionDetailStyles.emptyText}>Nenhum produto nesta promoção.</Text>}
      />

      {/* Modal de seleção de quantidade */}
      <Modal
        visible={quantityModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeQuantityModal}
      >
        <View style={promotionDetailStyles.modalOverlay}>
          <View style={promotionDetailStyles.modalContent}>
            <Text style={promotionDetailStyles.modalTitle}>Selecionar Quantidade</Text>

            {selectedItem && (
              <View style={promotionDetailStyles.modalProductInfo}>
                <Image
                  source={selectedItem.produto.produto_imagem_url ? { uri: selectedItem.produto.produto_imagem_url } : require('../../assets/placeholder.png')}
                  style={promotionDetailStyles.modalProductImage}
                  resizeMode="contain"
                />
                <View style={promotionDetailStyles.modalProductDetails}>
                  <Text style={promotionDetailStyles.modalProductName} numberOfLines={2}>
                    {selectedItem.produto.produto_nome}
                  </Text>
                  <Text style={promotionDetailStyles.modalProductPrice}>
                    R$ {selectedItem.itemPromocao_valor.toFixed(2)} cada
                  </Text>
                  <Text style={promotionDetailStyles.modalProductStock}>
                    Disponível: {Math.min(selectedItem.lote.lote_quantidade_atual, selectedItem.itemPromocao_qtde)} unidades
                  </Text>
                </View>
              </View>
            )}

            <View style={promotionDetailStyles.quantitySelector}>
              <TouchableOpacity
                style={promotionDetailStyles.quantityButton}
                onPress={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
              >
                <Ionicons name="remove" size={24} color="#007bff" />
              </TouchableOpacity>

              <Text style={promotionDetailStyles.quantityText}>{selectedQuantity}</Text>

              <TouchableOpacity
                style={promotionDetailStyles.quantityButton}
                onPress={() => setSelectedQuantity(Math.min(
                  selectedItem ? Math.min(selectedItem.lote.lote_quantidade_atual, selectedItem.itemPromocao_qtde) : 1,
                  selectedQuantity + 1
                ))}
              >
                <Ionicons name="add" size={24} color="#007bff" />
              </TouchableOpacity>
            </View>

            <Text style={promotionDetailStyles.totalText}>
              Total: R$ {(selectedItem ? selectedItem.itemPromocao_valor * selectedQuantity : 0).toFixed(2)}
            </Text>

            <View style={promotionDetailStyles.modalButtons}>
              <TouchableOpacity
                style={[promotionDetailStyles.modalButton, promotionDetailStyles.cancelButton]}
                onPress={closeQuantityModal}
              >
                <Text style={promotionDetailStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[promotionDetailStyles.modalButton, promotionDetailStyles.confirmButton]}
                onPress={confirmAddToCart}
              >
                <Ionicons name="cart" size={20} color="white" />
                <Text style={promotionDetailStyles.confirmButtonText}>Adicionar ao Carrinho</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PromotionDetailScreen;