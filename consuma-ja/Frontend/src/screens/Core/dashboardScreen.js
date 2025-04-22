// src/screens/Core/DashboardScreen.tsx (Arquivo movido)
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Importar hook
import { DrawerNavigationProp } from '@react-navigation/drawer';

const DashboardScreen = () => {
  // Obter a navegação (tipo Drawer)
  const navigation = useNavigation(); // Alternativa: receber via props { navigation }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        // Botão para ABRIR o Drawer
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 15 }}>
          <Ionicons name="menu" size={32} color="black" />
        </TouchableOpacity>
      ),
      title: 'Painel Principal'
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bem-vindo ao Painel</Text>
      <Text>(Conteúdo principal viria aqui)</Text>
      {/* Não renderiza mais o Sidebar aqui */}
    </View>
  );
};

export default DashboardScreen;