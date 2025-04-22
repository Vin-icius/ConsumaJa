import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const InicioScreen = () => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const allPromotions = [
    {
      id: 1,
      supplier: 'Fornecedor 1',
      products: [
        { id: 101, name: 'Leite Integral', category: 'Laticínios', price: 5.99, imageUrl: 'https://via.placeholder.com/80' },
        { id: 102, name: 'Arroz Branco', category: 'Grãos', price: 25.99, imageUrl: 'https://via.placeholder.com/80' }
      ],
      totalValue: 31.98
    },
    {
      id: 2,
      supplier: 'Fornecedor 2',
      products: [
        { id: 103, name: 'Detergente Neutro', category: 'Limpeza', price: 3.49, imageUrl: 'https://via.placeholder.com/80' },
        { id: 104, name: 'Sabão em Pó', category: 'Limpeza', price: 10.99, imageUrl: 'https://via.placeholder.com/80' }
      ],
      totalValue: 14.48
    }
  ];

  const [promotions, setPromotions] = useState(allPromotions);

  const handleSearch = () => {
    const filteredPromotions = allPromotions.filter(promo =>
      promo.supplier.toLowerCase().includes(search.toLowerCase()) ||
      promo.products.some(product => product.name.toLowerCase().includes(search.toLowerCase()))
    );
    setPromotions(filteredPromotions);
  };

  const addToCart = (product) => {
    setCart(prevCart => [...prevCart, product]);
  };

  const finalizePurchase = () => {
    if (cart.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos antes de finalizar a compra.');
      return;
    }
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    Alert.alert('Compra Finalizada', `Total: R$ ${total.toFixed(2)}`);
    setCart([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Promoções</Text>
        <TouchableOpacity onPress={finalizePurchase}>
          <Ionicons name="cart" size={28} color="black" />
          <Text>{cart.length}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar promoção ou produto..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter" size={28} color="black" style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.promotionCard}>
            <Text style={styles.promotionTitle}>{item.supplier}</Text>
            <View style={styles.productPreviewContainer}>
              {item.products.slice(0, 2).map(product => (
                <View key={product.id} style={styles.productPreview}>
                  <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                  <Text style={styles.productPrice}>R$ {product.price.toFixed(2)}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => setSelectedPromotion(item)}>
              <Text style={styles.viewDetails}>Ver Detalhes</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={!!selectedPromotion} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          {selectedPromotion && (
            <>
              <Text style={styles.modalTitle}>{selectedPromotion.supplier}</Text>
              {selectedPromotion.products.map(product => (
                <View key={product.id} style={styles.productDetail}>
                  <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                  <Text>{product.name} - R$ {product.price.toFixed(2)}</Text>
                  <TouchableOpacity onPress={() => addToCart(product)}>
                    <Text style={styles.addToCart}>Adicionar ao Carrinho</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={() => setSelectedPromotion(null)}>
                <Text style={styles.closeModal}>Fechar</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </Modal>

      <Modal visible={filterModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text>Filtrar por Categoria:</Text>
          <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory}>
            <Picker.Item label="Todas" value="" />
            <Picker.Item label="Laticínios" value="Laticínios" />
            <Picker.Item label="Grãos" value="Grãos" />
            <Picker.Item label="Limpeza" value="Limpeza" />
          </Picker>
          <TouchableOpacity onPress={() => { handleSearch(); setFilterModalVisible(false); }}>
            <Text>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center' },
  searchBar: { flex: 1, height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10 },
  filterIcon: { marginLeft: 10 },
  promotionCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 },
  promotionTitle: { fontSize: 18, fontWeight: 'bold' },
  productPreviewContainer: { flexDirection: 'row', marginTop: 10 },
  productPreview: { marginRight: 10, alignItems: 'center' },
  productImage: { width: 80, height: 80 },
  productPrice: { fontSize: 14, color: '#008000' },
  viewDetails: { color: 'blue', marginTop: 5 },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  productDetail: { marginBottom: 10 },
  addToCart: { color: 'green' },
  closeModal: { color: 'red', marginTop: 20, textAlign: 'center' }
});

export default InicioScreen;
