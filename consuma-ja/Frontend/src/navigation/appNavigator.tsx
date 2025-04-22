import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Alert, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// --- Componentes/Telas ---
import LoginScreen from '../screens/Auth/LoginScreen';
import CadastroEtapa1Screen from '../screens/Auth/CadastroEtapa1';
import CadastroEtapa2Screen from '../screens/Auth/CadastroEtapa2';
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
import Sidebar from '../components/Sidebar/Sidebar';


// --- Navegadores ---
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// --- Componente LogoutScreen ---
// (Com o return corrigido)
const LogoutScreen = () => {
    const navigation = useNavigation<any>();
    useEffect(() => { const performLogout = () => { Alert.alert( 'Sair','Tem certeza que deseja sair?', [ { text: 'Cancelar', style: 'cancel', onPress: () => navigation.goBack() }, { text: 'Sair', style: 'destructive', onPress: async () => { try { await AsyncStorage.removeItem('userType'); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); } catch (e) { console.error("Erro logout:", e); navigation.goBack();} } }, ], { cancelable: false } ); }; const timer = setTimeout(performLogout, 50); return () => clearTimeout(timer); }, [navigation]);
    // <<< CORRIGIDO: Retorna JSX >>>
    return (
      <View style={styles.logoutContainer}>
        <ActivityIndicator size="large" color="#2F4F4F" />
        <Text style={styles.logoutText}>Saindo...</Text>
      </View>
    );
 };


// --- Componente que define o Drawer Navigator ---
const MainAppDrawer = () => {
    // TODO: Substituir pela lógica real de obtenção do userType
    const userType: string | null = 'Admin'; // Simulado

    // <<< REFATORAÇÃO: Montar array de telas ANTES do return >>>
    const drawerScreens = [];

    // Telas Comuns (Adicionadas ao array com 'key')
    drawerScreens.push(<Drawer.Screen key="Inicio" name="Inicio" component={InicioScreen} options={{ title:'Início', drawerIcon: ({ color, size }) => (<Ionicons name="home-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Relatorios" name="Relatorios" component={RelatoriosScreen} options={{ title:'Relatórios', drawerIcon: ({ color, size }) => (<Ionicons name="stats-chart-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Configuracoes" name="Configuracoes" component={ConfigScreen} options={{ title:'Configurações', drawerIcon: ({ color, size }) => (<Ionicons name="settings-outline" color={color} size={size} />) }} />);

    // Telas de Cadastros Gerais
    drawerScreens.push(<Drawer.Screen key="Cadastro Categoria" name="Cadastro Categoria" component={CategoriaListScreen} options={{ title:'Gerenciar Categorias', drawerIcon: ({ color, size }) => (<Ionicons name="pricetag-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Cadastro Marca" name="Cadastro Marca" component={MarcaListScreen} options={{ title:'Gerenciar Marcas', drawerIcon: ({ color, size }) => (<Ionicons name="bookmark-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Cadastro Tipo" name="Cadastro Tipo" component={TipoListScreen} options={{ title:'Gerenciar Tipos', drawerIcon: ({ color, size }) => (<Ionicons name="file-tray-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Cadastro Produto" name="Cadastro Produto" component={ProductListScreen} options={{ title:'Gerenciar Produtos', drawerIcon: ({ color, size }) => (<Ionicons name="cube-outline" color={color} size={size} />) }}/>);
    drawerScreens.push(<Drawer.Screen key="Aprovacao de Produtos" name="Aprovacao de Produtos" component={AprovacaoListScreen} options={{ title:'Aprovar Produtos', drawerIcon: ({ color, size }) => (<Ionicons name="checkmark-done-outline" color={color} size={size} />) }}/>);

    // Telas de Localização
    drawerScreens.push(<Drawer.Screen key="EstadoList" name="EstadoList" component={EstadoListScreen} options={{ title:'Gerenciar Estados', drawerIcon: ({ color, size }) => (<Ionicons name="map-outline" color={color} size={size} />) }} />);
    drawerScreens.push(<Drawer.Screen key="CidadeList" name="CidadeList" component={CidadeListScreen} options={{ title:'Gerenciar Cidades', drawerIcon: ({ color, size }) => (<Ionicons name="business-outline" color={color} size={size} />) }} />);

    // Telas Condicionais (Adicionadas ao array se a condição for verdadeira)
    if (userType === 'CNPJ') {
        drawerScreens.push(
             <React.Fragment key="cnpj-screens">
                  <Drawer.Screen name="Promoções" component={PromocoesScreen} options={{ title:'Promoções', drawerIcon: ({ color, size }) => (<Ionicons name="megaphone-outline" color={color} size={size} />) }} />
                  <Drawer.Screen name="Entregas" component={EntregasScreen} options={{ title:'Entregas', drawerIcon: ({ color, size }) => (<Ionicons name="car-sport-outline" color={color} size={size} />) }}/>
                  <Drawer.Screen name="Feedbacks" component={FeedbacksScreen} options={{ title:'Feedbacks', drawerIcon: ({ color, size }) => (<Ionicons name="chatbubble-ellipses-outline" color={color} size={size} />) }}/>
             </React.Fragment>
         );
    }

    // Tela de Sair (Adicionada ao array)
    drawerScreens.push(<Drawer.Screen key="Sair" name="Sair" component={LogoutScreen} options={{ drawerItemStyle: { display: 'none' } }} />);
    // --- FIM DA REFATORAÇÃO ---

    return (
        <Drawer.Navigator
            id={undefined} // Mantém id={undefined}
            initialRouteName="Inicio"
            drawerContent={(props) => <Sidebar {...props} />}
            screenOptions={{ // Mantém screenOptions
                 headerStyle: { backgroundColor: '#4CAF50' },
                 headerTintColor: '#FFFFFF',
                 headerTitleStyle: { fontWeight: 'bold' },
                 drawerActiveTintColor: '#4CAF50',
                 drawerInactiveTintColor: 'white',
                 drawerLabelStyle: { color: 'white', fontSize: 16, marginLeft: -16},
                 drawerStyle: { backgroundColor: '#2F4F4F', width: '75%' },
             }}
        >
            {/* Renderiza as telas a partir do array */}
            {drawerScreens}
        </Drawer.Navigator>
    );
}

// --- Navegador Principal da Aplicação ---
const AppNavigator = () => {
  // Conteúdo mantido como antes
  return (
    <Stack.Navigator id={undefined} initialRouteName="Login">
      {/* ... Telas Login/Cadastro ... */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CadastroEtapa1" component={CadastroEtapa1Screen} options={{ title: 'Cadastro - Etapa 1' }} />
      <Stack.Screen name="CadastroEtapa2" component={CadastroEtapa2Screen} options={{ title: 'Cadastro - Etapa 2' }} />

      <Stack.Screen name="Dashboard" component={MainAppDrawer} options={{ headerShown: false }} />

      {/* ... Telas de Formulário/Detalhe ... */}
      <Stack.Screen name="EstadoForm" component={EstadoFormScreen} options={{ title: 'Formulário de Estado' }}/>
      <Stack.Screen name="CidadeForm" component={CidadeFormScreen} options={{ title: 'Formulário de Cidade' }}/>
      <Stack.Screen name="CategoriaForm" component={CategoriaFormScreen} options={{ title: 'Formulário de Categoria' }} />
      <Stack.Screen name="MarcaForm" component={MarcaFormScreen} options={{ title: 'Formulário de Marca' }} />
      <Stack.Screen name="TipoForm" component={TipoFormScreen} options={{ title: 'Formulário de Tipo' }} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Formulário de Produto' }} />
      <Stack.Screen name="AprovacaoDetail" component={AprovacaoDetailScreen} options={{ title: 'Aprovar/Rejeitar Produto' }} />
    </Stack.Navigator>
  );
};

// --- Estilos para LogoutScreen ---
const styles = StyleSheet.create({
    logoutContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)' },
    logoutText: { marginTop: 10, fontSize: 16, color: '#555' }
});


export default AppNavigator;