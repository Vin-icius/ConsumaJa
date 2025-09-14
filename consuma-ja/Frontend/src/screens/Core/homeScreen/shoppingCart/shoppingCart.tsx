import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { shoppingCartStyles } from '../../../../common/styles/Core/homeScreen/shoppingCart.styled';
import { useCart } from '../../../../contexts/CartContext/cartContext';
import promocaoService from '../../../../services/promocaoService';

interface CartItem {
  id: string;
  produto_id: number;
  produto_nome: string;
  produto_imagem_url?: string | null;
  lote_id: number;
  lote_codigo: string;
  itemPromocao_valor: number;
  quantidade: number;
  maxQuantidade: number; // estoque disponível para a promoção
  fornecedor_nome?: string; // Nome do fornecedor
}

const ShoppingCartScreen = () => {
  const navigation = useNavigation<any>();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalValue } = useCart();

  // Estados para os modais de confirmação
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Estado para loading do checkout
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleRemoveItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setRemoveModalVisible(true);
  };

  const confirmRemoveItem = () => {
    if (selectedItemId) {
      removeFromCart(selectedItemId);
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

  const confirmClearCart = () => {
    clearCart();
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
      // Formatar os dados do carrinho para o payload da API
      const saleData = {
        itens: cartItems.map(item => ({
          lote_id: item.lote_id,
          quantidade: item.quantidade,
          valor_unitario: item.itemPromocao_valor,
          promocao_id: item.promocao_id || null, // Pode ser null se não vier de promoção específica
        })),
        valor_total: getTotalValue(),
        quantidade_total_itens: getTotalItems(),
        // Adicionar data/hora da venda
        data_venda: new Date().toISOString(),
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
            onPress: () => navigation.goBack(), // Voltar para a tela anterior
          },
        ]
      );

    } catch (error: any) {
      console.error('Erro ao finalizar venda:', error);

      // Mostrar mensagem de erro
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          'Erro ao processar a compra. Tente novamente.';

      Alert.alert('Erro na Compra', errorMessage);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={shoppingCartStyles.cartItem}>
      <Image
        source={item.produto_imagem_url ? { uri: item.produto_imagem_url } : require('../../../../assets/placeholder.png')}
        style={shoppingCartStyles.productImage}
        resizeMode="contain"
      />

      <View style={shoppingCartStyles.itemDetails}>
        <Text style={shoppingCartStyles.productName} numberOfLines={2}>
          {item.produto_nome}
        </Text>
        {item.fornecedor_nome && (
          <Text style={shoppingCartStyles.supplierText}>
            Fornecedor: {item.fornecedor_nome}
          </Text>
        )}
        <Text style={shoppingCartStyles.loteInfo}>
          Lote: {item.lote_codigo}
        </Text>
        <Text style={shoppingCartStyles.priceText}>
          R$ {item.itemPromocao_valor.toFixed(2)} cada
        </Text>
      </View>

      <View style={shoppingCartStyles.quantityControls}>
        <TouchableOpacity
          style={shoppingCartStyles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantidade - 1)}
          disabled={item.quantidade <= 1}
        >
          <Ionicons name="remove" size={16} color={item.quantidade <= 1 ? "#ccc" : "#007bff"} />
        </TouchableOpacity>

        <Text style={shoppingCartStyles.quantityText}>{item.quantidade}</Text>

        <TouchableOpacity
          style={shoppingCartStyles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantidade + 1)}
          disabled={item.quantidade >= item.maxQuantidade}
        >
          <Ionicons name="add" size={16} color={item.quantidade >= item.maxQuantidade ? "#ccc" : "#007bff"} />
        </TouchableOpacity>
      </View>

      <View style={shoppingCartStyles.itemActions}>
        <Text style={shoppingCartStyles.itemTotal}>
          R$ {(item.itemPromocao_valor * item.quantidade).toFixed(2)}
        </Text>

        <TouchableOpacity
          style={shoppingCartStyles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
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

  return (
    <SafeAreaView style={shoppingCartStyles.container}>
      <View style={shoppingCartStyles.header}>
        <TouchableOpacity
          style={shoppingCartStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={shoppingCartStyles.headerTitle}>Carrinho de Compras</Text>

        {cartItems.length > 0 && (
          <TouchableOpacity
            style={shoppingCartStyles.clearButton}
            onPress={handleClearCart}
          >
            <Ionicons name="trash-outline" size={20} color="#dc3545" />
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={shoppingCartStyles.cartList}
            showsVerticalScrollIndicator={false}
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