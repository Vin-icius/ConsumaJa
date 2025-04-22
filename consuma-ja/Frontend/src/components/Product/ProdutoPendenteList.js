import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import produtoService from '../../services/produtoService';

function ProdutoPendenteList({ navigation }) {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await produtoService.listarProdutosPendentes();
        setProdutos(data);
      } catch (error) {
        console.error('Erro ao buscar produtos pendentes:', error);
      }
    }
    fetchData();
  }, []);

  const handleAprovar = (produtoId) => {
    navigation.navigate('AprovacaoProduto', { produtoId });
  };
  const handleRejeitar = (produtoId) => {
    navigation.navigate('RejeicaoProduto', { produtoId });
  };

  return (
    <FlatList
      data={produtos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View>
          <Text>{item.nome}
          <Button
              title="Aprovar"
              onPress={() => handleAprovar(item.id)}
            />
            <Button
            title="Rejeitar"
            onPress={() => handleRejeitar(item.id)}
          />
          </Text>
        </View>
      )}
    />
  );
}

export default ProdutoPendenteList;