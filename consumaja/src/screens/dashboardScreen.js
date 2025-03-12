import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity, Text } from 'react-native';

//importações das telas (screens)
import LoginScreen from '../screens/loginScreen';
import InicioScreen from '../screens/inicioScreen';
import ConfigScreen from '../screens/configScreen';
import RelatoriosScreen from '../screens/relatoriosScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const LogoutScreen = () => {
  const handleLogout = () => {
    console.log("Usuário deslogado");
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
      <Text style={{ fontSize: 18, color: '#FFFFFF' }}>Sair</Text>
    </TouchableOpacity>
  );
};

const DrawerNavigator = () => (
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
    <Drawer.Screen name="Sair" component={LogoutScreen} />
  </Drawer.Navigator>
);

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
