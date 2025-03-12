import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert, View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importação das telas
import LoginScreen from '../screens/loginScreen';
import InicioScreen from '../screens/inicioScreen';
import RelatoriosScreen from '../screens/relatoriosScreen';
import ConfigScreen from '../screens/configScreen';
import CadastroEtapa1 from '../screens/CadastroEtapa1';
import CadastroEtapa2 from '../screens/CadastroEtapa2';

const Stack = createStackNavigator();
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const LogoutButton = ({ navigation }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        Alert.alert('Sair', 'Tem certeza que deseja sair?', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            onPress: () => navigation.replace('Login'),
          },
        ]);
      }}
      style={{ padding: 10 }}
    >
      <Text style={{ fontSize: 18, color: 'red' }}>Sair</Text>
    </TouchableOpacity>
  );
};

const Sidebar = ({ navigation, isVisible, toggleMenu }) => {
  const translateX = isVisible ? 0 : -SCREEN_WIDTH * 0.6;
  return (
    <Animated.View style={{
      position: 'absolute',
      top: 40,
      left: translateX,
      width: SCREEN_WIDTH * 0.6,
      height: SCREEN_HEIGHT - 40,
      backgroundColor: '#2F4F4F',
      padding: 20,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      elevation: 5,
    }}>
      <TouchableOpacity onPress={toggleMenu} style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
        <Ionicons name="close" size={32} color="white" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { navigation.navigate('Inicio'); toggleMenu(); }}>
        <Text style={{ fontSize: 18, color: 'white', marginBottom: 15 }}>Início</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { navigation.navigate('Relatorios'); toggleMenu(); }}>
        <Text style={{ fontSize: 18, color: 'white', marginBottom: 15 }}>Relatórios</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { navigation.navigate('Configurações'); toggleMenu(); }}>
        <Text style={{ fontSize: 18, color: 'white', marginBottom: 15 }}>Configurações</Text>
      </TouchableOpacity>
      <LogoutButton navigation={navigation} />
    </Animated.View>
  );
};

const DashboardScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => setMenuVisible(!menuVisible);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity onPress={toggleMenu} style={{ position: 'absolute', top: 50, left: 20 }}>
        <Ionicons name="menu" size={32} color="black" />
      </TouchableOpacity>
      <Text>Bem-vindo ao Painel</Text>
      <Sidebar navigation={navigation} isVisible={menuVisible} toggleMenu={toggleMenu} />
    </View>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro Etapa 1" component={CadastroEtapa1} />
      <Stack.Screen name="Cadastro Etapa 2" component={CadastroEtapa2} />
      <Stack.Screen name="Inicio" component={InicioScreen} />
      <Stack.Screen name="Configurações" component={ConfigScreen} />
      <Stack.Screen name="Relatorios" component={RelatoriosScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;