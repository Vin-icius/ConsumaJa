import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const InicioScreen = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  const allProducts = [
    { id: 1, name: 'Leite Integral', brand: 'Marca A', type: 'Bebida', category: 'Laticínios', measure: '1L', price: 5.99, imageUrl: 'https://via.placeholder.com/80' },
    { id: 2, name: 'Arroz Branco', brand: 'Marca B', type: 'Alimento', category: 'Grãos', measure: '5Kg', price: 25.99, imageUrl: 'https://via.placeholder.com/80' },
    { id: 3, name: 'Detergente Neutro', brand: 'Marca C', type: 'Limpeza', category: 'Produtos de Limpeza', measure: '500ML', price: 3.49, imageUrl: 'https://via.placeholder.com/80' }
  ];

  const [products, setProducts] = useState(allProducts);

  const handleSearch = () => {
    const filteredProducts = allProducts.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedType ? item.type === selectedType : true) &&
      (selectedCategory ? item.category === selectedCategory : true) &&
      (selectedBrand ? item.brand === selectedBrand : true)
    );
    setProducts(filteredProducts);
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
    Alert.alert('Compra Finalizada', `Total: R$ ${total.toFixed(2)}\nData: ${new Date().toLocaleDateString()}`);
    setCart([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Consuma!</Text>
        <TouchableOpacity onPress={finalizePurchase}>
          <Ionicons name="cart" size={28} color="black" />
          <Text>{cart.length}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar produto..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter" size={28} color="black" style={styles.filterIcon} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDescription}>{item.brand} - {item.type} - {item.measure}</Text>
              <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
                <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={filterModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text>Filtrar por:</Text>
          <Picker selectedValue={selectedType} onValueChange={setSelectedType}>
            <Picker.Item label="Tipo" value="" />
            <Picker.Item label="Bebida" value="Bebida" />
            <Picker.Item label="Alimento" value="Alimento" />
            <Picker.Item label="Limpeza" value="Limpeza" />
          </Picker>
          <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory}>
            <Picker.Item label="Categoria" value="" />
            <Picker.Item label="Laticínios" value="Laticínios" />
            <Picker.Item label="Grãos" value="Grãos" />
            <Picker.Item label="Produtos de Limpeza" value="Produtos de Limpeza" />
          </Picker>
          <Picker selectedValue={selectedBrand} onValueChange={setSelectedBrand}>
            <Picker.Item label="Marca" value="" />
            <Picker.Item label="Marca A" value="Marca A" />
            <Picker.Item label="Marca B" value="Marca B" />
            <Picker.Item label="Marca C" value="Marca C" />
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
  productCard: { flexDirection: 'row', marginBottom: 16, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  productImage: { width: 80, height: 80, marginRight: 10 },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, fontWeight: 'bold' },
  productDescription: { fontSize: 14, color: '#666' },
  productPrice: { fontSize: 16, color: '#008000', marginTop: 5 },
});

export default InicioScreen;