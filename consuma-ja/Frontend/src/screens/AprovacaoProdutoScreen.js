import React from 'react';
import ProdutoPendenteList from '../components/ProdutoPendenteList';
import ProdutoAprovacaoForm from '../components/ProdutoAprovacaoForm';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function AprovacaoProdutoScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Produtos Pendentes" component={ProdutoPendenteList} />
      <Stack.Screen name="Aprovar/Rejeitar Produto" component={ProdutoAprovacaoForm} />
    </Stack.Navigator>
  );
}

export default AprovacaoProdutoScreen;