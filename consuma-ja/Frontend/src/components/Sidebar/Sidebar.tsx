import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';

// Tipagem das props
import type { DrawerContentComponentProps } from '@react-navigation/drawer';

const Sidebar = (props: DrawerContentComponentProps) => {
  const { state, navigation, ...restProps } = props;

  // Filtra a rota 'Sair' para não ser renderizada pelo DrawerItemList padrão
  const filteredRoutes = state.routes.filter((route) => route.name !== 'Sair');
  let filteredIndex = state.routes.findIndex((route) => route.name === state.routes[state.index].name && route.name !== 'Sair');
  if (filteredIndex === -1 && state.index >= 0 && state.routes[state.index].name === 'Sair') {
    filteredIndex = -1;
  }
  const filteredState = { ...state, routes: filteredRoutes, index: filteredIndex };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DrawerContentScrollView 
        {...props} 
        style={styles.sidebarContainer} 
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>ConsumaJá!</Text>
          <TouchableOpacity onPress={() => navigation.closeDrawer()} style={styles.closeButton}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Corrigido: Passando filteredState como state e o restante das props separadamente */}
        <DrawerItemList 
          {...restProps}
          state={filteredState}
          navigation={navigation}
        />

        {/* Espaçador flexível para empurrar o botão de logout para baixo */}
        <View style={styles.spacer} />

        {/* Renderiza o item 'Sair' separadamente no final */}
        <View style={styles.logoutSection}>
          <DrawerItem
            label=" Sair"
            icon={({ color, size }) => <Ionicons name="log-out-outline" color={color} size={size} />}
            onPress={() => navigation.navigate('Sair')}
            labelStyle={styles.drawerLabelStyle}
            inactiveTintColor='white'
          />
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

// Estilos para o Sidebar
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2F4F4F',
  },
  sidebarContainer: {
    flex: 1,
    backgroundColor: '#2F4F4F',
  },
  scrollViewContent: {
    flexGrow: 1, // Permite que o conteúdo cresça
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30, // Padding adicional na parte inferior
  },
  header: {
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 50 : 60, // Ajuste para a barra de status
    paddingBottom: 20,
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#4a7c7c'
  },
  headerText: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  closeButton: { 
    padding: 5 
  },
  drawerLabelStyle: {
    color: 'white',
    fontSize: 16,
    marginLeft: -16,
  },
  spacer: {
    flex: 0.7, // Ocupa todo o espaço disponível, empurrando o logout para baixo
  },
  logoutSection: {
  paddingTop: 20,
  marginHorizontal: 10,
  borderTopWidth: 1,
  borderTopColor: '#4a7c7c',
  paddingBottom: Platform.OS === 'ios' ? 40 : 20, // Valor base menor
  marginBottom: Platform.OS === 'android' ? 20 : 0, // Garante que não encoste na navbar do Android
},
});

export default Sidebar;