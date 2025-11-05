import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createShoppingCartStyles } from '../../../../common/styles/Core/homeScreen/shoppingCart.styled';
import { useCart } from '../../../../contexts/CartContext/cartContext';
import type { CartItem as CartContextItem } from '../../../../contexts/CartContext/cartContext';
import promocaoService from '../../../../services/promocaoService';
import authService from '../../../../services/authService';
import locationService from '../../../../services/locationService';

type CartItem = CartContextItem;

const ShoppingCartScreen = () => {
  const navigation = useNavigation<any>();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalValue, refreshCart } = useCart();
  const { width } = useWindowDimensions();
  const shoppingCartStyles = useMemo(() => createShoppingCartStyles(width >= 768), [width]);

  // Estados para os modais de confirmação
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  
  // Estado para loading do checkout
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshCart().catch((error: any) => {
        console.error('Erro ao sincronizar carrinho ao abrir a tela:', error);
      });
    }, [refreshCart]),
  );

  const handleRemoveItem = (itemId: number) => {
    setSelectedItemId(itemId);
    setRemoveModalVisible(true);
  };

  const confirmRemoveItem = async () => {
    if (selectedItemId) {
      try {
        await removeFromCart(selectedItemId);
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Erro ao remover item do carrinho.';
        Alert.alert('Erro', message);
      }
    }
    setRemoveModalVisible(false);
    setSelectedItemId(null);
  };

  const cancelRemoveItem = () => {
    setRemoveModalVisible(false);
    setSelectedItemId(null);
  };

  const handleClearCart = () => {
    setClearModalVisible(true);
  };

  const confirmClearCart = async () => {
    try {
      await clearCart();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Erro ao limpar o carrinho.';
      Alert.alert('Erro', message);
    }
    setClearModalVisible(false);
  };

  const cancelClearCart = () => {
    setClearModalVisible(false);
  };

  // Função para finalizar a compra
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione itens ao carrinho antes de finalizar a compra.');
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const loggedUser = await authService.getStoredUser();
      if (!loggedUser?.id) {
        Alert.alert('Sessão expirada', 'Faça login novamente para finalizar a compra.');
        return;
      }

  const itemWithoutPromotion = cartItems.find(item => !item.promocaoId);
      if (itemWithoutPromotion) {
        Alert.alert('Item inválido', 'Um dos itens do carrinho não está vinculado a uma promoção ativa. Remova e adicione novamente.');
        return;
      }

      const enderecos = await locationService.getEnderecos({ pessoaId: loggedUser.id, ativo: 'true', limit: 1 });
      const enderecoSelecionado = Array.isArray(enderecos) && enderecos.length > 0 ? enderecos[0] : null;

      if (!enderecoSelecionado?.endereco_id) {
        Alert.alert('Endereço necessário', 'Cadastre um endereço válido antes de finalizar a compra.');
        return;
      }

      // Formatar os dados do carrinho para o payload da API
      const saleData = {
        pessoa_id: loggedUser.id,
        endereco_id: enderecoSelecionado.endereco_id,
        itens: cartItems.map(item => ({
          lote_id: item.loteId,
          quantidade: item.quantidade,
          valor_unitario: item.unitPrice,
          promocao_id: item.promocaoId!,
        })),
        valor_total: getTotalValue(),
        quantidade_total_itens: getTotalItems(),
        data_venda: new Date().toISOString(),
        cart_item_ids: cartItems.map(item => item.cartItemId),
      };

      console.log('Enviando dados da venda:', saleData);

      // Fazer a chamada da API
      const response = await promocaoService.finalizarVenda(saleData);

      console.log('Venda finalizada com sucesso:', response);

      // Limpar o carrinho após venda bem-sucedida
      clearCart();

      // Mostrar mensagem de sucesso
      Alert.alert(
        'Compra Finalizada!',
        'Sua compra foi processada com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error: any) {
      console.error('Erro ao finalizar venda:', error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao processar a compra. Tente novamente.';

      Alert.alert('Erro na Compra', errorMessage);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleQuantityChange = useCallback(
    async (item: CartItem, nextQuantity: number) => {
      try {
        await updateQuantity(item.cartItemId, nextQuantity);
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Não foi possível atualizar a quantidade.';
        Alert.alert('Erro', message);
      }
    },
    [updateQuantity],
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={shoppingCartStyles.cartItem}>
      <Image
        source={item.produtoImagemUrl ? { uri: item.produtoImagemUrl } : require('../../../../assets/placeholder.png')}
        style={shoppingCartStyles.productImage}
        resizeMode="contain"
      />

      <View style={shoppingCartStyles.itemDetails}>
        <Text style={shoppingCartStyles.productName} numberOfLines={2}>
          {item.produtoNome}
        </Text>
        {item.fornecedorNome && (
          <Text style={shoppingCartStyles.supplierText}>
            Fornecedor: {item.fornecedorNome}
          </Text>
        )}
        <Text style={shoppingCartStyles.loteInfo}>
          Lote: {item.loteCodigo}
        </Text>
        <Text style={shoppingCartStyles.priceText}>
          R$ {item.unitPrice.toFixed(2)} cada
        </Text>
        {item.isOutOfStock && (
          <Text style={shoppingCartStyles.outOfStockText}>Item esgotado</Text>
        )}
      </View>

      <View style={shoppingCartStyles.quantityControls}>
        <TouchableOpacity
          style={shoppingCartStyles.quantityButton}
          onPress={() => handleQuantityChange(item, item.quantidade - 1)}
          disabled={item.quantidade <= 1}
        >
          <Ionicons name="remove" size={16} color={item.quantidade <= 1 ? "#ccc" : "#007bff"} />
        </TouchableOpacity>

        <Text style={shoppingCartStyles.quantityText}>{item.quantidade}</Text>

        <TouchableOpacity
          style={shoppingCartStyles.quantityButton}
          onPress={() => handleQuantityChange(item, item.quantidade + 1)}
          disabled={item.quantidade >= item.maxQuantidade}
        >
          <Ionicons name="add" size={16} color={item.quantidade >= item.maxQuantidade ? "#ccc" : "#007bff"} />
        </TouchableOpacity>
      </View>

      <View style={shoppingCartStyles.itemActions}>
        <Text style={shoppingCartStyles.itemTotal}>
          R$ {(item.unitPrice * item.quantidade).toFixed(2)}
        </Text>

        <TouchableOpacity
          style={shoppingCartStyles.removeButton}
          onPress={() => handleRemoveItem(item.cartItemId)}
        >
          <Ionicons name="trash-outline" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={shoppingCartStyles.emptyCart}>
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text style={shoppingCartStyles.emptyCartText}>Seu carrinho está vazio</Text>
      <Text style={shoppingCartStyles.emptyCartSubtext}>
        Adicione produtos das promoções para começar suas compras
      </Text>
      <TouchableOpacity
        style={shoppingCartStyles.continueShoppingButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={shoppingCartStyles.continueShoppingText}>Continuar Comprando</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartSummary = () => (
    <View style={shoppingCartStyles.cartSummary}>
      <View style={shoppingCartStyles.summaryRow}>
        <Text style={shoppingCartStyles.summaryLabel}>Total de Itens:</Text>
        <Text style={shoppingCartStyles.summaryValue}>{getTotalItems()}</Text>
      </View>

      <View style={shoppingCartStyles.summaryRow}>
        <Text style={shoppingCartStyles.summaryLabel}>Valor Total:</Text>
        <Text style={shoppingCartStyles.summaryTotal}>R$ {getTotalValue().toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={[shoppingCartStyles.checkoutButton, isCheckoutLoading && shoppingCartStyles.disabledButton]}
        onPress={handleCheckout}
        disabled={isCheckoutLoading}
      >
        {isCheckoutLoading ? (
          <Text style={shoppingCartStyles.checkoutButtonText}>Processando...</Text>
        ) : (
          <Text style={shoppingCartStyles.checkoutButtonText}>Finalizar Compra</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderCartHeader = () => (
    <View style={shoppingCartStyles.cartTitleRow}>
      <Text style={shoppingCartStyles.cartTitle}>Carrinho de Compras</Text>

      {cartItems.length > 0 && (
        <TouchableOpacity
          style={shoppingCartStyles.clearAllButton}
          onPress={handleClearCart}
        >
          <Ionicons name="trash-outline" size={18} color="#dc3545" />
          <Text style={shoppingCartStyles.clearAllButtonText}>Limpar carrinho</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={shoppingCartStyles.container}>
      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.cartItemId.toString()}
            contentContainerStyle={shoppingCartStyles.cartList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderCartHeader}
          />

          {renderCartSummary()}
        </>
      )}

      {/* Modal de confirmação para remover item */}
      <Modal
        visible={removeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelRemoveItem}
      >
        <View style={shoppingCartStyles.modalOverlay}>
          <View style={shoppingCartStyles.modalContent}>
            <Text style={shoppingCartStyles.modalTitle}>Remover Item</Text>
            <Text style={shoppingCartStyles.modalMessage}>
              Tem certeza que deseja remover este item do carrinho?
            </Text>
            <View style={shoppingCartStyles.modalButtons}>
              <TouchableOpacity
                style={[shoppingCartStyles.modalButton, shoppingCartStyles.cancelButton]}
                onPress={cancelRemoveItem}
              >
                <Text style={shoppingCartStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[shoppingCartStyles.modalButton, shoppingCartStyles.confirmButton]}
                onPress={confirmRemoveItem}
              >
                <Text style={shoppingCartStyles.confirmButtonText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmação para limpar carrinho */}
      <Modal
        visible={clearModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelClearCart}
      >
        <View style={shoppingCartStyles.modalOverlay}>
          <View style={shoppingCartStyles.modalContent}>
            <Text style={shoppingCartStyles.modalTitle}>Limpar Carrinho</Text>
            <Text style={shoppingCartStyles.modalMessage}>
              Tem certeza que deseja remover todos os itens do carrinho?
            </Text>
            <View style={shoppingCartStyles.modalButtons}>
              <TouchableOpacity
                style={[shoppingCartStyles.modalButton, shoppingCartStyles.cancelButton]}
                onPress={cancelClearCart}
              >
                <Text style={shoppingCartStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[shoppingCartStyles.modalButton, shoppingCartStyles.destructiveButton]}
                onPress={confirmClearCart}
              >
                <Text style={shoppingCartStyles.destructiveButtonText}>Limpar Tudo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ShoppingCartScreen;