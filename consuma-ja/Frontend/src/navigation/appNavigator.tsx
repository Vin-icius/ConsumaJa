// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Alert, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import LoginScreen from '../screens/Auth/LoginScreen';
import CadastroScreen from '../screens/Auth/CadastroScreen';
import LogoutScreen from '../screens/Auth/LogoutScreen';
import DashboardScreen from '../screens/Core/dashboardScreen';
import InicioScreen from '../screens/Core/inicioScreen';
import ConfigScreen from '../screens/Core/configScreen';
import RelatoriosScreen from '../screens/Reports/relatoriosScreen';
import EstadoListScreen from '../screens/Location/EstadoListScreen';
import EstadoFormScreen from '../screens/Location/EstadoFormScreen';
import CidadeListScreen from '../screens/Location/CidadeListScreen';
import CidadeFormScreen from '../screens/Location/CidadeFormScreen';
import PromocoesScreen from '../screens/Promotions/promocoesScreen';
import EntregasScreen from '../screens/Orders/entregasScreen';
import FeedbacksScreen from '../screens/Reviews/feedbacksScreen';
import CategoriaListScreen from '../screens/Product/CategoriaListScreen';
import CategoriaFormScreen from '../screens/Product/CategoriaFormScreen';
import MarcaListScreen from '../screens/Product/MarcaListScreen';
import MarcaFormScreen from '../screens/Product/MarcaFormScreen';
import TipoListScreen from '../screens/Product/TipoListScreen';
import TipoFormScreen from '../screens/Product/TipoFormScreen';
import ProductListScreen from '../screens/Product/ProductListScreen';
import ProductFormScreen from '../screens/Product/ProductFormScreen';
import AprovacaoListScreen from '../screens/Product/AprovacaoListScreen';
import AprovacaoDetailScreen from '../screens/Product/AprovacaoDetailScreen';
import PessoaListScreen from '../screens/User/PessoaListScreen';
import PessoaFormScreen from '../screens/User/PessoaFormScreen';
import Sidebar from '../components/Sidebar/Sidebar';


// --- Navegadores ---
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// --- Componente que define o Drawer Navigator ---
const MainAppDrawer = () => {
    const userType: string | null = 'Admin'; // Simulado

    // Monta array de telas ANTES do return
    const drawerScreens = [];

    // Telas Comuns
    drawerScreens.push(<Drawer.Screen key="Inicio" name="Inicio" component={InicioScreen} options={{ title:'Início', drawerIcon: ({ color, size }) => (<Ionicons name="home-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Relatorios" name="Relatorios" component={RelatoriosScreen} options={{ title:'Relatórios', drawerIcon: ({ color, size }) => (<Ionicons name="stats-chart-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Configuracoes" name="Configuracoes" component={ConfigScreen} options={{ title:'Configurações', drawerIcon: ({ color, size }) => (<Ionicons name="settings-outline" color={color} size={size} />) }} />);

    // Telas de Cadastros/Gerenciamento Produto
    drawerScreens.push(<Drawer.Screen key="Cadastro Categoria" name="Cadastro Categoria" component={CategoriaListScreen} options={{ title:'Gerenciar Categorias', drawerIcon: ({ color, size }) => (<Ionicons name="pricetag-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Cadastro Marca" name="Cadastro Marca" component={MarcaListScreen} options={{ title:'Gerenciar Marcas', drawerIcon: ({ color, size }) => (<Ionicons name="bookmark-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Cadastro Tipo" name="Cadastro Tipo" component={TipoListScreen} options={{ title:'Gerenciar Tipos', drawerIcon: ({ color, size }) => (<Ionicons name="file-tray-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Cadastro Produto" name="Cadastro Produto" component={ProductListScreen} options={{ title:'Gerenciar Produtos', drawerIcon: ({ color, size }) => (<Ionicons name="cube-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Aprovacao de Produtos" name="Aprovacao de Produtos" component={AprovacaoListScreen} options={{ title:'Aprovar Produtos', drawerIcon: ({ color, size }) => (<Ionicons name="checkmark-done-outline" color={color} size={size} />) }}/>);

    // Telas de Localização
    drawerScreens.push(<Drawer.Screen key="EstadoList" name="EstadoList" component={EstadoListScreen} options={{ title:'Gerenciar Estados', drawerIcon: ({ color, size }) => (<Ionicons name="map-outline" color={color} size={size} />) }} />);
    drawerScreens.push(<Drawer.Screen key="CidadeList" name="CidadeList" component={CidadeListScreen} options={{ title:'Gerenciar Cidades', drawerIcon: ({ color, size }) => (<Ionicons name="business-outline" color={color} size={size} />) }} />);

    // <<< ADICIONAR TELA DE GERENCIAR PESSOAS AO DRAWER >>>
    drawerScreens.push(<Drawer.Screen key="PessoaList" name="PessoaList" component={PessoaListScreen} options={{ title:'Gerenciar Usuários', drawerIcon: ({ color, size }) => (<Ionicons name="people-outline" color={color} size={size} />) }} />);
    // --------------------------------------------------

    // Telas Condicionais CNPJ
    if (userType === 'CNPJ') { /* ... */ }
    // Tela Sair
    drawerScreens.push(<Drawer.Screen key="Sair" name="Sair" component={LogoutScreen} options={{ drawerItemStyle: { display: 'none' } }} />);

    return (
        <Drawer.Navigator
            id={undefined}
            initialRouteName="Inicio"
            drawerContent={(props) => <Sidebar {...props} />}
            screenOptions={{ drawerActiveTintColor: '#4CAF50', // <<< Define a cor do ÍCONE e TEXTO ATIVO como verde
              drawerInactiveTintColor: 'white', // <<< Define a cor do ÍCONE e TEXTO INATIVO como branco
              drawerLabelStyle: { color: 'white', fontSize: 16, marginLeft: -16}, // <<< FORÇA a cor do TEXTO (label) a ser branco SEMPRE
              drawerStyle: { backgroundColor: '#2F4F4F', /*...*/ } }}
        >
            {drawerScreens}
        </Drawer.Navigator>
    );
}

// --- Navegador Principal da Aplicação ---
const AppNavigator = () => {
  return (
    <Stack.Navigator id={undefined} initialRouteName="Login">
      {/* Telas fora do Drawer */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Criar Conta' }} />
      {/* Remover CadastroEtapa1/2 se não mais usados */}
      {/* <Stack.Screen name="CadastroEtapa1" component={CadastroEtapa1Screen} options={{ title: 'Cadastro - Etapa 1' }} /> */}
      {/* <Stack.Screen name="CadastroEtapa2" component={CadastroEtapa2Screen} options={{ title: 'Cadastro - Etapa 2' }} /> */}


      {/* Tela que contém o Drawer */}
      <Stack.Screen name="Dashboard" component={MainAppDrawer} options={{ headerShown: false }} />

      {/* Telas de Formulário/Detalhe chamadas de dentro do Drawer */}
      <Stack.Screen name="EstadoForm" component={EstadoFormScreen} options={{ title: 'Formulário de Estado' }}/>
      <Stack.Screen name="CidadeForm" component={CidadeFormScreen} options={{ title: 'Formulário de Cidade' }}/>
      <Stack.Screen name="CategoriaForm" component={CategoriaFormScreen} options={{ title: 'Formulário de Categoria' }} />
      <Stack.Screen name="MarcaForm" component={MarcaFormScreen} options={{ title: 'Formulário de Marca' }} />
      <Stack.Screen name="TipoForm" component={TipoFormScreen} options={{ title: 'Formulário de Tipo' }} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Formulário de Produto' }} />
      <Stack.Screen name="AprovacaoDetail" component={AprovacaoDetailScreen} options={{ title: 'Aprovar/Rejeitar Produto' }}/>
      {/* <<< ADICIONADA TELA PessoaForm ao Stack >>> */}
      <Stack.Screen name="PessoaForm" component={PessoaFormScreen} options={{ title: 'Editar Usuário' }} />
      {/* ----------------------------------------- */}

    </Stack.Navigator>
  );
};

// --- Estilos para LogoutScreen (se definido aqui) ---
const styles = StyleSheet.create({
    logoutContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)' },
    logoutText: { marginTop: 10, fontSize: 16, color: '#555' }
});

export default AppNavigator;