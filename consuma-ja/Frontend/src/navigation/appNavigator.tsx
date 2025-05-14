// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Alert, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

<<<<<<< HEAD
import LoginScreen from '../screens/Auth/LoginScreen';
import CadastroScreen from '../screens/Auth/CadastroScreen';
import LogoutScreen from '../screens/Auth/LogoutScreen';
import DashboardScreen from '../screens/Core/dashboardScreen';
import InicioScreen from '../screens/Core/inicioScreen';
import ConfigScreen from '../screens/Core/configScreen';
import RelatoriosScreen from '../screens/Reports/relatoriosScreen';
=======
// --- Componentes/Telas ---
import LoginScreen from '../screens/Auth/LoginScreen';
import CadastroScreen from '../screens/Auth/CadastroScreen';
import LogoutScreen from '../screens/Auth/LogoutScreen';
import DashboardScreen from '../screens/Core/dashboardScreen'; // Não usado diretamente como screen, mas Inicio sim
import InicioScreen from '../screens/Core/InicioScreen';
import ConfigScreen from '../screens/Core/configScreen';
import RelatoriosScreen from '../screens/Reports/relatoriosScreen';

>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
import EstadoListScreen from '../screens/Location/EstadoListScreen';
import EstadoFormScreen from '../screens/Location/EstadoFormScreen';
import CidadeListScreen from '../screens/Location/CidadeListScreen';
import CidadeFormScreen from '../screens/Location/CidadeFormScreen';
<<<<<<< HEAD
import PromocoesScreen from '../screens/Promotions/promocoesScreen';
import EntregasScreen from '../screens/Orders/entregasScreen';
import FeedbacksScreen from '../screens/Reviews/feedbacksScreen';
=======

// Removido PromocoesScreen se InicioScreen é a lista principal de promoções para o cliente
// import PromocoesScreen from '../screens/Promotions/promocoesScreen';
import PromocaoListScreen from '../screens/Promotions/PromocaoListScreen'; // Para Gerenciar Promoções (Admin)
import PromocaoDetailScreen from '../screens/Promotions/PromocaoDetailScreen';
import PromocaoFormScreen from '../screens/Promotions/PromocaoFormScreen';


import EntregasScreen from '../screens/Orders/entregasScreen';
import FeedbacksScreen from '../screens/Reviews/feedbacksScreen';

>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
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
<<<<<<< HEAD
import PessoaListScreen from '../screens/User/PessoaListScreen';
import PessoaFormScreen from '../screens/User/PessoaFormScreen';
=======

import PessoaListScreen from '../screens/User/PessoaListScreen';
import PessoaFormScreen from '../screens/User/PessoaFormScreen';

// <<< ADICIONAR IMPORTS PARA LOTES >>>
import LoteListScreen from '../screens/Lotes/LoteListScreen';
import LoteFormScreen from '../screens/Lotes/LoteFormScreen';
// -----------------------------------

>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
import Sidebar from '../components/Sidebar/Sidebar';


// --- Navegadores ---
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

<<<<<<< HEAD
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
    drawerScreens.push(<Drawer.Screen key="Cadastro Categoria" name="Cadastro Categoria" component={CategoriaListScreen} options={{ title:'Gerenciar Categorias', drawerIcon: ({ color, size }) => (<Ionicons name="pricetag-outline" color={color} size={size}/>) }}/>);
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

=======
// --- Componente LogoutScreen (se definido aqui) ---
// const LogoutScreen = () => { ...código como antes... };


// --- Componente que define o Drawer Navigator ---
const MainAppDrawer = () => {
    const userType: string | null = 'Admin'; // Simulado
    const drawerScreens = [];

    // Telas Comuns
    drawerScreens.push(<Drawer.Screen key="Inicio" name="Inicio" component={InicioScreen} options={{ title:'Início', drawerIcon: ({ size }) => (<Ionicons name="home-outline" color={'white'} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Relatorios" name="Relatorios" component={RelatoriosScreen} options={{ title:'Relatórios', drawerIcon: ({ size }) => (<Ionicons name="stats-chart-outline" color={'white'} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Configuracoes" name="Configuracoes" component={ConfigScreen} options={{ title:'Configurações', drawerIcon: ({ size }) => (<Ionicons name="settings-outline" color={'white'} size={size} />) }} />);

    // Telas de Cadastros/Gerenciamento Produto
    drawerScreens.push(<Drawer.Screen key="Cadastro Categoria" name="Cadastro Categoria" component={CategoriaListScreen} options={{ title:'Gerenciar Categorias', drawerIcon: ({ size }) => (<Ionicons name="pricetag-outline" color={'white'} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Cadastro Marca" name="Cadastro Marca" component={MarcaListScreen} options={{ title:'Gerenciar Marcas', drawerIcon: ({ size }) => (<Ionicons name="bookmark-outline" color={'white'} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Cadastro Tipo" name="Cadastro Tipo" component={TipoListScreen} options={{ title:'Gerenciar Tipos', drawerIcon: ({ size }) => (<Ionicons name="file-tray-outline" color={'white'} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Cadastro Produto" name="Cadastro Produto" component={ProductListScreen} options={{ title:'Gerenciar Produtos', drawerIcon: ({ size }) => (<Ionicons name="cube-outline" color={'white'} size={size} />) }}/>);
    // <<< ADICIONAR TELA DE GERENCIAR LOTES AO DRAWER >>>
    drawerScreens.push(<Drawer.Screen key="LoteList" name="LoteList" component={LoteListScreen} options={{ title:'Gerenciar Lotes', drawerIcon: ({ size }) => (<Ionicons name="layers-outline" color={'white'} size={size} />) }} />);
    // -------------------------------------------------
    drawerScreens.push(<Drawer.Screen key="Aprovacao de Produtos" name="Aprovacao de Produtos" component={AprovacaoListScreen} options={{ title:'Aprovar Produtos', drawerIcon: ({ size }) => (<Ionicons name="checkmark-done-outline" color={'white'} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="PromocaoList" name="PromocaoList" component={PromocaoListScreen} options={{ title:'Gerenciar Promoções', drawerIcon: ({ size }) => (<Ionicons name="megaphone-outline" color={'white'} size={size} />) }} />);

    // Telas de Localização
    drawerScreens.push(<Drawer.Screen key="EstadoList" name="EstadoList" component={EstadoListScreen} options={{ title:'Gerenciar Estados', drawerIcon: ({ size }) => (<Ionicons name="map-outline" color={'white'} size={size} />) }} />);
    drawerScreens.push(<Drawer.Screen key="CidadeList" name="CidadeList" component={CidadeListScreen} options={{ title:'Gerenciar Cidades', drawerIcon: ({ size }) => (<Ionicons name="business-outline" color={'white'} size={size} />) }} />);
    // Tela de Gerenciar Pessoas
    drawerScreens.push(<Drawer.Screen key="PessoaList" name="PessoaList" component={PessoaListScreen} options={{ title:'Gerenciar Usuários', drawerIcon: ({ size }) => (<Ionicons name="people-outline" color={'white'} size={size} />) }} />);

    // Telas Condicionais CNPJ
    if (userType === 'CNPJ') {
        drawerScreens.push(
             <React.Fragment key="cnpj-screens">
                  <Drawer.Screen name="Minhas Promoções" component={PromocaoListScreen} /* Ou uma tela específica para fornecedor */ options={{ title:'Minhas Promoções', drawerIcon: ({ size }) => (<Ionicons name="megaphone-outline" color={'white'} size={size} />) }} />
                  <Drawer.Screen name="Minhas Entregas" component={EntregasScreen} options={{ title:'Minhas Entregas', drawerIcon: ({ size }) => (<Ionicons name="car-sport-outline" color={'white'} size={size} />) }}/>
                  <Drawer.Screen name="Meus Feedbacks" component={FeedbacksScreen} options={{ title:'Meus Feedbacks', drawerIcon: ({ size }) => (<Ionicons name="chatbubble-ellipses-outline" color={'white'} size={size} />) }}/>
             </React.Fragment>
         );
    }
    // Tela Sair
    drawerScreens.push(<Drawer.Screen key="Sair" name="Sair" component={LogoutScreen} options={{ drawerItemStyle: { display: 'none' } }} />);


>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
    return (
        <Drawer.Navigator
            id={undefined}
            initialRouteName="Inicio"
            drawerContent={(props) => <Sidebar {...props} />}
<<<<<<< HEAD
            screenOptions={{ drawerActiveTintColor: '#4CAF50', // <<< Define a cor do ÍCONE e TEXTO ATIVO como verde
              drawerInactiveTintColor: 'white', // <<< Define a cor do ÍCONE e TEXTO INATIVO como branco
              drawerLabelStyle: { color: 'white', fontSize: 16, marginLeft: 5}, // <<< FORÇA a cor do TEXTO (label) a ser branco SEMPRE
              drawerStyle: { backgroundColor: '#2F4F4F', /*...*/ } }}
=======
            screenOptions={{
                 headerStyle: { backgroundColor: '#4CAF50' },
                 headerTintColor: '#FFFFFF',
                 headerTitleStyle: { fontWeight: 'bold' },
                 drawerActiveTintColor: '#81c784', // Um verde mais claro para o item ativo
                 drawerInactiveTintColor: 'white',
                 drawerLabelStyle: { color: 'white', fontSize: 16, marginLeft: -16},
                 drawerStyle: { backgroundColor: '#2F4F4F', width: '75%' },
             }}
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
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
<<<<<<< HEAD
      {/* Remover CadastroEtapa1/2 se não mais usados */}
      {/* <Stack.Screen name="CadastroEtapa1" component={CadastroEtapa1Screen} options={{ title: 'Cadastro - Etapa 1' }} /> */}
      {/* <Stack.Screen name="CadastroEtapa2" component={CadastroEtapa2Screen} options={{ title: 'Cadastro - Etapa 2' }} /> */}

=======
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)

      {/* Tela que contém o Drawer */}
      <Stack.Screen name="Dashboard" component={MainAppDrawer} options={{ headerShown: false }} />

      {/* Telas de Formulário/Detalhe chamadas de dentro do Drawer */}
      <Stack.Screen name="EstadoForm" component={EstadoFormScreen} options={{ title: 'Formulário de Estado' }}/>
      <Stack.Screen name="CidadeForm" component={CidadeFormScreen} options={{ title: 'Formulário de Cidade' }}/>
      <Stack.Screen name="CategoriaForm" component={CategoriaFormScreen} options={{ title: 'Formulário de Categoria' }} />
      <Stack.Screen name="MarcaForm" component={MarcaFormScreen} options={{ title: 'Formulário de Marca' }} />
      <Stack.Screen name="TipoForm" component={TipoFormScreen} options={{ title: 'Formulário de Tipo' }} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Formulário de Produto' }} />
<<<<<<< HEAD
      <Stack.Screen name="AprovacaoDetail" component={AprovacaoDetailScreen} options={{ title: 'Aprovar/Rejeitar Produto' }}/>
      {/* <<< ADICIONADA TELA PessoaForm ao Stack >>> */}
      <Stack.Screen name="PessoaForm" component={PessoaFormScreen} options={{ title: 'Editar Usuário' }} />
      {/* ----------------------------------------- */}

=======
      <Stack.Screen name="AprovacaoDetail" component={AprovacaoDetailScreen} options={{ title: 'Analisar Produto' }}/>
      <Stack.Screen name="PessoaForm" component={PessoaFormScreen} options={{ title: 'Editar Usuário' }} />
      <Stack.Screen name="PromocaoDetail" component={PromocaoDetailScreen} options={{ title: 'Detalhes da Promoção' }}/>
      <Stack.Screen name="PromocaoForm" component={PromocaoFormScreen} />
      {/* <<< ADICIONADA TELA LoteForm ao Stack >>> */}
      <Stack.Screen name="LoteForm" component={LoteFormScreen} options={{ title: 'Formulário de Lote' }} />
      {/* ----------------------------------------- */}
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
    </Stack.Navigator>
  );
};

// --- Estilos para LogoutScreen (se definido aqui) ---
const styles = StyleSheet.create({
    logoutContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)' },
    logoutText: { marginTop: 10, fontSize: 16, color: '#555' }
});

export default AppNavigator;