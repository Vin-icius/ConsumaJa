import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'; // Removido Dimensions, ScrollView, Animated se não usar mais
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
// import LogoutButton from '../Auth/LogoutButton'; // <<< REMOVIDO import LogoutButton

// Tipagem das props (recomendado)
import type { DrawerContentComponentProps } from '@react-navigation/drawer';

const Sidebar = (props: DrawerContentComponentProps) => { // Usando tipo do React Navigation
  const { state, navigation } = props;

  // Filtra a rota 'Sair' para não ser renderizada pelo DrawerItemList padrão,
  // pois podemos querer estilizá-la ou posicioná-la de forma diferente (opcional).
  // Se quiser que DrawerItemList mostre 'Sair', remova este filtro.
  const filteredRoutes = state.routes.filter((route) => route.name !== 'Sair');
  // Calcula o índice correto para o estado filtrado (senão pode dar erro de item ativo)
   let filteredIndex = state.routes.findIndex((route) => route.name === state.routes[state.index].name && route.name !== 'Sair');
   if (filteredIndex === -1 && state.index >= 0 && state.routes[state.index].name === 'Sair') {
       // Se a rota ativa era 'Sair', não define nenhum índice ativo no estado filtrado
       filteredIndex = -1; // Ou defina para uma rota padrão como 'Inicio' se preferir
   }
  const filteredState = { ...state, routes: filteredRoutes, index: filteredIndex };


  return (
    <DrawerContentScrollView {...props} style={styles.sidebarContainer} contentContainerStyle={{ paddingTop: 0 }}>
        <View style={styles.header}>
            <Text style={styles.headerText}>ConsumaJá!</Text>
             <TouchableOpacity onPress={() => navigation.closeDrawer()} style={styles.closeButton}>
                <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
        </View>

        {/* Renderiza os itens definidos no DrawerNavigator (exceto 'Sair' por causa do filtro) */}
        <DrawerItemList state={filteredState} {...props} />

        {/* Renderiza o item 'Sair' separadamente no final */}
        {/* Isso permite aplicar estilos diferentes ou colocá-lo em uma seção separada */}
         <View style={styles.logoutSection}>
             <DrawerItem
                label=" Sair"
                icon={({ color, size }) => <Ionicons name="log-out-outline" color={color} size={size} />}
                onPress={() => navigation.navigate('Sair')} // Navega para a rota 'Sair' que usa LogoutScreen
                labelStyle={styles.drawerLabelStyle}
                inactiveTintColor='white' // Cor do ícone/texto
            />
        </View>

    </DrawerContentScrollView>
  );
};

// Estilos para o Sidebar
const styles = StyleSheet.create({
    sidebarContainer: {
        flex: 1,
        backgroundColor: '#2F4F4F',
    },
    header: {
        paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20,
        marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#4a7c7c'
    },
    headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
     closeButton: { padding: 5 },
    drawerLabelStyle: { // Estilo para os labels dos DrawerItems padrão e o customizado 'Sair'
        color: 'white',
        fontSize: 16,
        marginLeft: -16,
    },
    logoutSection: { // Estilos para a seção do botão Sair
       marginTop: 'auto', // Tenta empurrar para baixo (pode não funcionar perfeitamente dependendo do conteúdo acima)
       paddingTop: 20,
       marginHorizontal: 10,
       borderTopWidth: 1,
       borderTopColor: '#4a7c7c',
       marginBottom: 20, // Adiciona espaço abaixo
    },
});

export default Sidebar;