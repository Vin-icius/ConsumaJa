import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, Modal, useWindowDimensions, TextInput } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import promocaoService from '../../services/promocaoService';
import { Ionicons } from '@expo/vector-icons';
import { createPromotionDetailStyles } from '../../common/styles/Promotions/promotionDetailScreen.styled';
import { useCart } from '../../contexts/CartContext/cartContext';
import { resolveProductImageUrl } from '../../utils/image';

const DEFAULT_PRODUCT_IMAGE = require('../../assets/placeholder.png');

const getProductImageSource = (uri?: string | null) => {
  if (uri && typeof uri === 'string' && uri.trim().length > 0) {
    const resolved = resolveProductImageUrl(uri);
    if (resolved) {
      return { uri: resolved };
    }
  }
  return DEFAULT_PRODUCT_IMAGE;
};
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
  const [addingToCart, setAddingToCart] = useState(false);

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

  useFocusEffect(useCallback(() => {
    fetchDetalhes();
  }, [fetchDetalhes]));

  const { width } = useWindowDimensions();
  const promotionDetailStyles = useMemo(() => createPromotionDetailStyles(width >= 768), [width]);

  const maxAvailable = useMemo(() => {
    if (!selectedItem) return 1;
    return Math.max(0, Math.min(selectedItem.lote.lote_quantidade_atual, selectedItem.itemPromocao_qtde));
  }, [selectedItem]);

  const updateQuantity = useCallback((value: number) => {
    const normalized = Number.isFinite(value) ? value : 1;
    const clamped = Math.max(1, Math.min(normalized, maxAvailable || 1));
    setSelectedQuantity(clamped);
  }, [maxAvailable]);

  const openQuantityModal = (item: ItemPromocaoParaDetalhe) => {
    const available = Math.min(item.lote.lote_quantidade_atual, item.itemPromocao_qtde);
    if (available <= 0) {
      Alert.alert('Indisponível', 'Esta promoção não possui quantidade disponível no momento.');
      return;
    }
    setSelectedItem(item);
    setSelectedQuantity(1);
    setQuantityModalVisible(true);
  };

  const closeQuantityModal = () => {
    setQuantityModalVisible(false);
    setSelectedItem(null);
    setSelectedQuantity(1);
  };

  const handleDecrease = () => updateQuantity(selectedQuantity - 1);
  const handleIncrease = () => updateQuantity(selectedQuantity + 1);

  const handleQuantityInputChange = (text: string) => {
    const sanitized = text.replace(/\D/g, '');
    if (!sanitized) {
      setSelectedQuantity(1);
      return;
    }
    updateQuantity(parseInt(sanitized, 10));
  };

  const effectiveMaxAvailable = maxAvailable || 1;

  useEffect(() => {
    if (!quantityModalVisible || !selectedItem) return;
    if (selectedQuantity > effectiveMaxAvailable) {
      setSelectedQuantity(Math.max(1, effectiveMaxAvailable));
    }
  }, [effectiveMaxAvailable, quantityModalVisible, selectedItem, selectedQuantity]);

  const confirmAddToCart = async () => {
    if (!selectedItem || !promocao) return;

    const maxPermitido = Math.min(selectedItem.lote.lote_quantidade_atual, selectedItem.itemPromocao_qtde);
    if (maxPermitido <= 0) {
      Alert.alert('Indisponível', 'Esta promoção não possui quantidade disponível no momento.');
      return;
    }

    const quantidadeFinal = Math.min(selectedQuantity, maxPermitido);

    setAddingToCart(true);
    try {
      await addToCartContext({
        produtoId: selectedItem.produto.produto_id,
        loteId: selectedItem.LOTEPROD_lote_id,
        promocaoId: promocao.promocao_id,
        quantidade: quantidadeFinal,
      });
      Alert.alert(
        'Sucesso!',
        `${selectedItem.produto.produto_nome} adicionado ao carrinho (${quantidadeFinal} unidade${quantidadeFinal > 1 ? 's' : ''}).`,
      );
      closeQuantityModal();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Não foi possível adicionar o item ao carrinho.';
      Alert.alert('Erro', message);
    } finally {
      setAddingToCart(false);
    }
  };

  const renderProductItem = ({ item }: { item: ItemPromocaoParaDetalhe }) => {
    const nomeCompleto = `${item.produto.produto_nome}${item.produto.marca?.marca_nome ? `, ${item.produto.marca.marca_nome}` : ''}${item.produto.categoria?.categoria_nome ? `, ${item.produto.categoria.categoria_nome}` : ''}${item.produto.tipo?.tipo_nome ? `, ${item.produto.tipo.tipo_nome}` : ''}`;
    const validadeString = item.lote.lote_validade ? new Date(item.lote.lote_validade).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
    const disponibilidadeLote = Math.max(0, item.lote.lote_quantidade_atual);
    const disponibilidadePromo = Math.max(0, item.itemPromocao_qtde);
    const disponibilidadeTotal = Math.min(disponibilidadeLote, disponibilidadePromo);
    const isDisponivel = disponibilidadeTotal > 0;

    return (
        <View style={promotionDetailStyles.productItem}>
          <Image
            source={getProductImageSource(item.produto.produto_imagem_url)}
            style={promotionDetailStyles.productImage}
            resizeMode="contain"
          />
          <View style={promotionDetailStyles.productInfo}>
            <Text style={promotionDetailStyles.productName}>{nomeCompleto}</Text>
            <Text style={promotionDetailStyles.productMeasure}>Medida: {item.produto.produto_medida || 'N/A'}</Text>
            {item.produto.produto_precoOriginal != null && (
                <Text style={promotionDetailStyles.originalPrice}>De: R$ {Number(item.produto.produto_precoOriginal).toFixed(2)}</Text>
            )}
            <Text style={promotionDetailStyles.promoPrice}>Por: R$ {Number(item.itemPromocao_valor).toFixed(2)}</Text>
            <Text style={promotionDetailStyles.productStock}>
              Disponível (lote): {disponibilidadeLote} / Ofertado (promo): {disponibilidadePromo}
            </Text>
            <Text style={promotionDetailStyles.productStock}>Quantidade restante para venda: {disponibilidadeTotal}</Text>
            <Text style={promotionDetailStyles.productValidity}>Validade Lote: {validadeString}</Text>
          </View>
          <TouchableOpacity
            style={[promotionDetailStyles.addToCartButton, !isDisponivel && promotionDetailStyles.disabledButton]}
            onPress={() => openQuantityModal(item)}
            disabled={!isDisponivel}
          >
            <Ionicons name="cart-outline" size={20} color="white" />
            <Text style={promotionDetailStyles.addToCartButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#007bff" style={promotionDetailStyles.centered} />;
  if (error) {
    return (
      <View style={promotionDetailStyles.centered}>
        <Text style={promotionDetailStyles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchDetalhes}>
          <Text style={promotionDetailStyles.retryText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!promocao) {
    return (
      <View style={promotionDetailStyles.centered}>
        <Text style={promotionDetailStyles.emptyText}>Promoção não encontrada ou dados inválidos.</Text>
      </View>
    );
  }

  return (
    <View style={promotionDetailStyles.screen}>
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
                  source={getProductImageSource(selectedItem.produto.produto_imagem_url)}
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
                onPress={handleDecrease}
                disabled={selectedQuantity <= 1}
              >
                <Ionicons name="remove" size={24} color={selectedQuantity <= 1 ? '#ccd4dc' : '#007bff'} />
              </TouchableOpacity>

              <TextInput
                style={promotionDetailStyles.quantityInput}
                keyboardType="numeric"
                value={String(selectedQuantity)}
                onChangeText={handleQuantityInputChange}
                returnKeyType="done"
                maxLength={3}
              />

              <TouchableOpacity
                style={promotionDetailStyles.quantityButton}
                onPress={handleIncrease}
                disabled={selectedQuantity >= effectiveMaxAvailable}
              >
                <Ionicons name="add" size={24} color={selectedQuantity >= effectiveMaxAvailable ? '#ccd4dc' : '#007bff'} />
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
                style={[promotionDetailStyles.modalButton, promotionDetailStyles.confirmButton, addingToCart && promotionDetailStyles.disabledButton]}
                onPress={confirmAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cart" size={20} color="white" />
                    <Text style={promotionDetailStyles.confirmButtonText}>Adicionar ao Carrinho</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PromotionDetailScreen;