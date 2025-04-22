import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import produtoService from '../../services/produtoService';

function ProdutoAprovacaoForm({ route, navigation }) {
  const { produtoId } = route.params;
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  const handleAprovar = async () => {
    await produtoService.aprovarProduto(produtoId);
    navigation.goBack();
  };

  const handleRejeitar = async () => {
    await produtoService.rejeitarProduto(produtoId, motivoRejeicao);
    navigation.goBack();
  };

  return (
    <View>
      <Button title="Aprovar" onPress={handleAprovar} />
      <Text>Motivo da Rejeição:</Text>
      <TextInput value={motivoRejeicao} onChangeText={setMotivoRejeicao} />
      <Button title="Rejeitar" onPress={handleRejeitar} />
    </View>
  );
}

export default ProdutoAprovacaoForm;