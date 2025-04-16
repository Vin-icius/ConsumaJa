import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importações das telas (screens)
import LoginScreen from '../screens/loginScreen';
import InicioScreen from '../screens/inicioScreen';
import ConfigScreen from '../screens/configScreen';
import RelatoriosScreen from '../screens/relatoriosScreen';
import PromocoesScreen from '../screens/promocoesScreen';
import EntregasScreen from '../screens/entregasScreen';
import FeedbacksScreen from '../screens/feedbacksScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const LogoutScreen = ({ navigation }) => {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userType');
    navigation.replace('Login');
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
      <Text style={{ fontSize: 18, color: '#FFFFFF' }}>Sair</Text>
    </TouchableOpacity>
  );
};

const DrawerNavigator = () => {
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchUserType = async () => {
      const storedUserType = await AsyncStorage.getItem('userType');
      setUserType(storedUserType);
    };
    fetchUserType();
  }, []);

  return (
    userType && (
      <Drawer.Navigator
        initialRouteName="Inicio"
        screenOptions={{
          drawerStyle: { backgroundColor: '#2F4F4F', width: 240 },
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#FFFFFF',
        }}
      >
        <Drawer.Screen name="Inicio" component={InicioScreen} />
        <Drawer.Screen name="Relatorios" component={RelatoriosScreen} />
        <Drawer.Screen name="Configurações" component={ConfigScreen} />
        <Drawer.Screen name="Cadastro Categoria" component={CadastroCategoriaScreen} />
        <Drawer.Screen name="Cadastro Marca" component={CadastroMarcaScreen} />
        <Drawer.Screen name="Cadastro Tipo" component={CadastroTipoScreen} />
        <Drawer.Screen name="Cadastro Produto" component={CadastroProdutoScreen} />
        <Drawer.Screen name="Aprovação de Produtos" component={AprovacaoProdutoScreen} />
        {userType === 'CNPJ' && (
          <>
            <Drawer.Screen name="Promoções" component={PromocoesScreen} />
            <Drawer.Screen name="Entregas" component={EntregasScreen} />
            <Drawer.Screen name="Feedbacks" component={FeedbacksScreen} />
          </>
        )}
        <Drawer.Screen name="Sair" component={LogoutScreen} />
      </Drawer.Navigator>
    )
  );
};

/*

      <Drawer.Screen name="Cadastro Categoria" component={CadastroCategoriaScreen} />
      <Drawer.Screen name="Cadastro Marca" component={CadastroMarcaScreen} />
      <Drawer.Screen name="Cadastro Tipo" component={CadastroTipoScreen} />
      <Drawer.Screen name="Cadastro Produto" component={CadastroProdutoScreen} />
      <Drawer.Screen name="Aprovação de Produtos" component={AprovacaoProdutoScreen} />


      <Stack.Screen name="Cadastro Categoria" component={CadastroCategoriaScreen} />
      <Stack.Screen name="Cadastro Marca" component={CadastroMarcaScreen} />
      <Stack.Screen name="Cadastro Tipo" component={CadastroTipoScreen} />
      <Stack.Screen name="Cadastro Produto" component={CadastroProdutoScreen} />
      <Stack.Screen name="Aprovação de Produtos" component={AprovacaoProdutoScreen} />
*/

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={DrawerNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
