import type React from "react"
import { useState, useEffect } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createDrawerNavigator } from "@react-navigation/drawer"
import { Ionicons } from "@expo/vector-icons"
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'

import LoginScreen from "../screens/Auth/LoginScreen"
import CadastroScreen from "../screens/Auth/RegisterScreen"
import LogoutScreen from "../screens/Auth/LogoutScreen"
import InicioScreen from "../screens/Core/homeScreen"
import ConfigScreen from "../screens/Core/configScreen"
import RelatoriosScreen from "../screens/Reports/relatoriosScreen"
import EstadoListScreen from "../screens/Location/EstadoListScreen"
import EstadoFormScreen from "../screens/Location/EstadoFormScreen"
import CidadeListScreen from "../screens/Location/cityListScreen"
import CityFormScreen from "../screens/Location/cityFormScreen"
import CategoriaListScreen from "../screens/Product/CategoriaListScreen"
import CategoriaFormScreen from "../screens/Product/CategoriaFormScreen"
import MarcaListScreen from "../screens/Product/MarcaListScreen"
import MarcaFormScreen from "../screens/Product/MarcaFormScreen"
import TipoListScreen from "../screens/Product/TipoListScreen"
import TipoFormScreen from "../screens/Product/TipoFormScreen"
import ProductListScreen from "../screens/Product/ProductListScreen"
import ProductFormScreen from "../screens/Product/ProductFormScreen"
import AprovacaoListScreen from "../screens/Product/AprovacaoListScreen"
import AprovacaoDetailScreen from "../screens/Product/AprovacaoDetailScreen"
import UserListScreen from "../screens/User/userListScreen"
import UserFormScreen from "../screens/User/userFormScreen"
import AvaliacaoFormScreen from '../screens/Review/AvaliacaoFormScreen';

import PromotionListItem from '../screens/Promotions/promotionListScreen'
import PromotionDetailScreen from '../screens/Promotions/promotionDetailScreen'
import PromotionFormScreen from '../screens/Promotions/promotionFormScreen'
import LotFormScreen from "../screens/Lots/lotFormScreen"
import LotListScreen from "../screens/Lots/lotListScreen"
import { navigatorStyles } from "../common/styles/appNavigator/appNavigator"

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Dashboard: undefined;
  EstadoForm: { estadoId?: number };
  CidadeForm: { cidadeId?: number };
  CategoriaForm: { categoriaId?: number };
  MarcaForm: { marcaId?: number };
  TipoForm: { tipoId?: number };
  ProductForm: { produtoId?: number };
  AprovacaoDetail: { produto: any };
  PessoaForm: { pessoaId?: number };
  // --- Adicione a nova rota aqui ---
  AvaliacaoQuestionario: { pedidoId: number };
};

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Dashboard: undefined;
  EstadoForm: { estadoId?: number };
  CidadeForm: { cidadeId?: number };
  CategoriaForm: { categoriaId?: number };
  MarcaForm: { marcaId?: number };
  TipoForm: { tipoId?: number };
  ProductForm: { produtoId?: number };
  AprovacaoDetail: { produto: any };
  PessoaForm: { pessoaId?: number };
  // --- Adicione a nova rota aqui ---
  AvaliacaoQuestionario: { pedidoId: number };
};

// --- Navegadores ---
const Stack = createNativeStackNavigator()
const Drawer = createDrawerNavigator()

// --- Tipos de usuário ---
type UserRole = "Admin" | "Fornecedor" | "Cliente"

// --- Interface para itens do menu ---
interface MenuItem {
  key: string
  name: string
  component: React.ComponentType<any>
  title: string
  icon: (props: { color: string; size: number }) => React.ReactNode
  roles: UserRole[]
}

// --- Interface para seções do menu ---
interface MenuSection {
  title: string
  items: MenuItem[]
  isDropdown?: boolean
  roles: UserRole[]
}

// --- Componente personalizado para o Drawer ---
const CustomDrawerContent = (props: any) => {
  const [userRole, setUserRole] = useState<UserRole>("Admin") // Valor padrão para teste
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    Admin: false,
    Fornecedor: false,
  })

  // Função para alternar a expansão de um dropdown
  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }))
  }

  // Buscar o papel do usuário do AsyncStorage (simulado aqui)
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole")
        if (role && (role === "Admin" || role === "Fornecedor" || role === "Cliente")) {
          setUserRole(role as UserRole)
        }
      } catch (error) {
        console.error("Erro ao buscar papel do usuário:", error)
      }
    }

    // Comentado para usar o valor padrão 'Admin' para teste
    // getUserRole();
  }, [])

  // Definição das seções e itens do menu
  const menuSections: MenuSection[] = [
    {
      title: "Geral",
      items: [
        {
          key: "Inicio",
          name: "Inicio",
          component: InicioScreen,
          title: "Início",
          icon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
          roles: ["Admin", "Fornecedor", "Cliente"],
        },
      ],
      roles: ["Admin", "Fornecedor", "Cliente"],
    },
    {
      title: "Fornecedor",
      isDropdown: true,
      items: [
        {
          key: "Cadastro Produto",
          name: "Cadastro Produto",
          component: ProductListScreen,
          title: "Gerenciar Produtos",
          icon: ({ color, size }) => <Ionicons name="cube-outline" color={color} size={size} />,
          roles: ["Admin", "Fornecedor"],
        },
        {
          key: "PromocaoList",
          name: "PromocaoList",
          component: PromotionListItem,
          title: 'Gerenciar Promoções', 
          icon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
          roles: ["Admin", "Fornecedor"],
       },
        {
          key: "LoteList",
          name: "LoteList",
          component: LotListScreen,
          title: 'Gerenciar Lotes', 
          icon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
          roles: ["Admin", "Fornecedor"],
       },
      ],
      roles: ["Admin", "Fornecedor"],
    },
    {
      title: "Admin",
      isDropdown: true,
      items: [
        {
          key: "Cadastro Categoria",
          name: "Cadastro Categoria",
          component: CategoriaListScreen,
          title: "Gerenciar Categorias",
          icon: ({ color, size }) => <Ionicons name="pricetag-outline" color={color} size={size} />,
          roles: ["Admin"],
        },
        {
          key: "Cadastro Marca",
          name: "Cadastro Marca",
          component: MarcaListScreen,
          title: "Gerenciar Marcas",
          icon: ({ color, size }) => <Ionicons name="bookmark-outline" color={color} size={size} />,
          roles: ["Admin"],
        },
        {
          key: "Cadastro Tipo",
          name: "Cadastro Tipo",
          component: TipoListScreen,
          title: "Gerenciar Tipos",
          icon: ({ color, size }) => <Ionicons name="file-tray-outline" color={color} size={size} />,
          roles: ["Admin"],
        },
        {
          key: "Aprovacao de Produtos",
          name: "Aprovacao de Produtos",
          component: AprovacaoListScreen,
          title: "Aprovar Produtos",
          icon: ({ color, size }) => <Ionicons name="checkmark-done-outline" color={color} size={size} />,
          roles: ["Admin"],
        },
        {
          key: "EstadoList",
          name: "EstadoList",
          component: EstadoListScreen,
          title: "Gerenciar Estados",
          icon: ({ color, size }) => <Ionicons name="map-outline" color={color} size={size} />,
          roles: ["Admin"],
        },
        {
          key: "CidadeList",
          name: "CidadeList",
          component: CidadeListScreen,
          title: "Gerenciar Cidades",
          icon: ({ color, size }) => <Ionicons name="business-outline" color={color} size={size} />,
          roles: ["Admin"],
        },
        {
          key: "PessoaList",
          name: "PessoaList",
          component: UserListScreen,
          title: "Gerenciar Usuários",
          icon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
          roles: ["Admin"],
        },
      ],
      roles: ["Admin"],
    },
    {
      title: "Sistema",
      items: [
        {
          key: "Relatorios",
          name: "Relatorios",
          component: RelatoriosScreen,
          title: "Relatórios",
          icon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size} />,
          roles: ["Admin"],
        },
        {
          key: "Configuracoes",
          name: "Configuracoes",
          component: ConfigScreen,
          title: "Configurações",
          icon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
          roles: ["Admin", "Fornecedor", "Cliente"],
        },
      ],
      roles: ["Admin", "Fornecedor", "Cliente"],
    },
  ]

  // Filtrar seções com base no papel do usuário
  const filteredSections = menuSections.filter((section) => section.roles.includes(userRole))
  const insets = useSafeAreaInsets();
  return (
    
    <SafeAreaView style={[navigatorStyles.drawerContainer, { paddingBottom: insets.bottom }]}>
      <View style={navigatorStyles.drawerHeader}>
        <Text style={navigatorStyles.drawerTitle}>ConsumaJá!</Text>
        <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={navigatorStyles.menuScrollView}>
        {filteredSections.map((section, sectionIndex) => (
          <View key={`section-${sectionIndex}`}>
            {section.title !== "Geral" && (
              <View style={navigatorStyles.sectionHeader}>
                {section.isDropdown ? (
                  <TouchableOpacity style={navigatorStyles.dropdownHeader} onPress={() => toggleSection(section.title)}>
                    <Text style={navigatorStyles.sectionTitle}>{section.title}</Text>
                    <Ionicons
                      name={expandedSections[section.title] ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                ) : (
                  <Text style={navigatorStyles.sectionTitle}>{section.title}</Text>
                )}
              </View>
            )}

            {(!section.isDropdown || expandedSections[section.title]) &&
              section.items
                .filter((item) => item.roles.includes(userRole))
                .map((item, itemIndex) => (
                  <TouchableOpacity
                    key={`item-${item.key}`}
                    style={[
                      navigatorStyles.menuItem,
                      section.isDropdown && navigatorStyles.submenuItem,
                      props.state.routes[props.state.index].name === item.name && navigatorStyles.activeMenuItem,
                    ]}
                    onPress={() => {
                      props.navigation.navigate(item.name)
                    }}
                  >
                    {item.icon({
                      color: props.state.routes[props.state.index].name === item.name ? "#4CAF50" : "white",
                      size: 24,
                    })}
                    <Text
                      style={[
                        navigatorStyles.menuItemText,
                        props.state.routes[props.state.index].name === item.name && navigatorStyles.activeMenuItemText,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}

            {sectionIndex < filteredSections.length - 1 && <View style={navigatorStyles.divider} />}
          </View>
        ))}
      </ScrollView>

      <View style={navigatorStyles.logoutButtonContainer}>
        <TouchableOpacity style={navigatorStyles.logoutButton} onPress={() => props.navigation.navigate("Sair")}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={navigatorStyles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// --- Componente que define o Drawer Navigator ---
const MainAppDrawer = () => {
  // Definição das telas do Drawer
  const drawerScreens = [
    // Tela Início
    <Drawer.Screen
      key="Inicio"
      name="Inicio"
      component={InicioScreen}
      options={{
        title: "Início",
        drawerIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
      }}
    />,

    // Tela Gerenciar Produtos (Fornecedor)
    <Drawer.Screen
      key="Cadastro Produto"
      name="Cadastro Produto"
      component={ProductListScreen}
      options={{
        title: "Gerenciar Produtos",
        drawerIcon: ({ color, size }) => <Ionicons name="cube-outline" color={color} size={size} />,
      }}
    />,
    <Drawer.Screen 
      key="PromocaoList" 
      name="PromocaoList" 
      component={PromotionListItem} 
      options={{ 
        title:'Gerenciar Promoções', 
        drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
       }} 
    />,
    <Drawer.Screen 
      key="PromocaoForm" 
      name="PromocaoForm" 
      component={PromotionFormScreen} 
      options={{ 
        title:'Gerenciar Promoções', 
        drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
       }} 
    />,
    <Drawer.Screen 
      key="PromocaoDetail" 
      name="PromocaoDetail" 
      component={PromotionDetailScreen} 
      options={{ 
        title:'Detalhes das Promoções', 
        drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
       }} 
    />,
    <Drawer.Screen 
      key="LoteList" 
      name="LoteList" 
      component={LotListScreen} 
      options={{ 
        title:'Listagem de lotes', 
        drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
       }} 
    />,
    <Drawer.Screen 
      key="LoteForm" 
      name="LoteForm" 
      component={LotFormScreen} 
      options={{ 
        title:'Formulário de lotes', 
        drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
       }} 
    />,

    // Telas Admin
    <Drawer.Screen
      key="Cadastro Categoria"
      name="Cadastro Categoria"
      component={CategoriaListScreen}
      options={{
        title: "Gerenciar Categorias",
        drawerIcon: ({ color, size }) => <Ionicons name="pricetag-outline" color={color} size={size} />,
      }}
    />,
    <Drawer.Screen
      key="Cadastro Marca"
      name="Cadastro Marca"
      component={MarcaListScreen}
      options={{
        title: "Gerenciar Marcas",
        drawerIcon: ({ color, size }) => <Ionicons name="bookmark-outline" color={color} size={size} />,
      }}
    />,
    <Drawer.Screen
      key="Cadastro Tipo"
      name="Cadastro Tipo"
      component={TipoListScreen}
      options={{
        title: "Gerenciar Tipos",
        drawerIcon: ({ color, size }) => <Ionicons name="file-tray-outline" color={color} size={size} />,
      }}
    />,
    <Drawer.Screen
      key="Aprovacao de Produtos"
      name="Aprovacao de Produtos"
      component={AprovacaoListScreen}
      options={{
        title: "Aprovar Produtos",
        drawerIcon: ({ color, size }) => <Ionicons name="checkmark-done-outline" color={color} size={size} />,
      }}
    />,
    <Drawer.Screen
      key="EstadoList"
      name="EstadoList"
      component={EstadoListScreen}
      options={{
        title: "Gerenciar Estados",
        drawerIcon: ({ color, size }) => <Ionicons name="map-outline" color={color} size={size} />,
      }}
    />,
    <Drawer.Screen
      key="CidadeList"
      name="CidadeList"
      component={CidadeListScreen}
      options={{
        title: "Gerenciar Cidades",
        drawerIcon: ({ color, size }) => <Ionicons name="business-outline" color={color} size={size} />,
      }}
    />,
    <Drawer.Screen
      key="PessoaList"
      name="PessoaList"
      component={UserListScreen}
      options={{
        title: "Gerenciar Usuários",
        drawerIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
      }}
    />,

    // Telas Sistema (no final)
    <Drawer.Screen
      key="Relatorios"
      name="Relatorios"
      component={RelatoriosScreen}
      options={{
        title: "Relatórios",
        drawerIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size} />,
      }}
    />,
    <Drawer.Screen
      key="Configuracoes"
      name="Configuracoes"
      component={ConfigScreen}
      options={{
        title: "Configurações",
        drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
      }}
    />,

    // Tela Sair (oculta no drawer)
    <Drawer.Screen
      key="Sair"
      name="Sair"
      component={LogoutScreen}
      options={{ drawerItemStyle: { display: "none" } }}
    />,
  ]

  return (
    <Drawer.Navigator
      initialRouteName="Inicio"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: "#4CAF50",
        drawerInactiveTintColor: "white",
        drawerLabelStyle: { color: "white", fontSize: 16, marginLeft: 5 },
        drawerStyle: { backgroundColor: "#2F4F4F" },
      }}
    >
      {drawerScreens}
    </Drawer.Navigator>
  )
}

// --- Navegador Principal da Aplicação ---
const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <Stack.Navigator initialRouteName="Login">
        {/* Telas fora do Drawer */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: "Criar Conta" }} />

        {/* Tela que contém o Drawer */}
        <Stack.Screen name="Dashboard" component={MainAppDrawer} options={{ headerShown: false }} />

        {/* Telas de Formulário/Detalhe chamadas de dentro do Drawer */}
        <Stack.Screen name="EstadoForm" component={EstadoFormScreen} options={{ title: "Formulário de Estado" }} />
        <Stack.Screen name="CidadeForm" component={CityFormScreen} options={{ title: "Formulário de Cidade" }} />
        <Stack.Screen
          name="CategoriaForm"
          component={CategoriaFormScreen}
          options={{ title: "Formulário de Categoria" }}
        />
        <Stack.Screen name="MarcaForm" component={MarcaFormScreen} options={{ title: "Formulário de Marca" }} />
        <Stack.Screen name="TipoForm" component={TipoFormScreen} options={{ title: "Formulário de Tipo" }} />
        <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: "Formulário de Produto" }} />
        <Stack.Screen name="AvaliacaoForm" component={AvaliacaoFormScreen} options={{ title: 'Avaliar Produto' }}
      />
        <Stack.Screen
          name="AprovacaoDetail"
          component={AprovacaoDetailScreen}
          options={{ title: "Aprovar/Rejeitar Produto" }}
        />
        <Stack.Screen name="PessoaForm" component={UserFormScreen} options={{ title: "Editar Usuário" }} />
        <Stack.Screen name="AvaliacaoQuestionario" component={AvaliacaoFormScreen} options={{ title: 'Avaliar Compra' }} />
      </Stack.Navigator>
    </SafeAreaProvider>
  )
}

export default AppNavigator