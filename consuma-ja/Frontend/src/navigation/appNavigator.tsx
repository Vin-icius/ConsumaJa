import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createDrawerNavigator } from "@react-navigation/drawer"
import { Ionicons } from "@expo/vector-icons"
import { View, Text, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { baseIconMap, createMenuSections, MenuItem, MenuSection, UserRole } from "./menuConfig"

// Dynamic import for SafeArea components to avoid bundling issues on web
let SafeAreaView: any
let SafeAreaProvider: any
let useSafeAreaInsets: any

try {
  const safeAreaModule = require('react-native-safe-area-context')
  SafeAreaView = safeAreaModule.SafeAreaView
  SafeAreaProvider = safeAreaModule.SafeAreaProvider
  useSafeAreaInsets = safeAreaModule.useSafeAreaInsets
} catch (error) {
  // Fallback for web or when module is not available
  SafeAreaView = View
  SafeAreaProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
  useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 })
  console.warn('react-native-safe-area-context not available, using fallback components')
}

import LoginScreen from "../screens/Auth/LoginScreen"
import CadastroScreen from "../screens/Auth/RegisterScreen"
import LogoutScreen from "../screens/Auth/LogoutScreen"
import ConfigScreen from "../screens/Core/configScreen"
import RelatoriosScreen from "../screens/Reports/RelatoriosScreen"
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
import RelatorioAvaliacoesScreen from "../screens/Reports/RelatorioAvaliacoesScreen"
import EntregasScreen from '../screens/Orders/entregasScreen';
import DeliverySimulationScreen from '../screens/Orders/DeliverySimulationScreen';
import ReclamacaoFormScreen from '../screens/Review/ReclamacaoFormScreen';
import ReclamacaoAdminListScreen from '../screens/Review/ReclamacaoAdminListScreen';

import PromotionDetailScreen from '../screens/Promotions/promotionDetailScreen'
import ShoppingCartScreen from '../screens/Core/homeScreen/shoppingCart/shoppingCart'
import PromotionFormScreen from '../screens/Promotions/promotionFormScreen'
import PromotionComponent from '../screens/Promotions/promotionComponent'
import PromotionScreenWrapper from '../screens/Promotions/promotionScreenWrapper'
import LotFormScreen from "../screens/Lots/lotFormScreen"
import LotListScreen from "../screens/Lots/lotListScreen"
import { navigatorStyles } from "../common/styles/appNavigator/appNavigator"
import { SearchProvider } from '../contexts/SearchHomeContext/searchHomeContext'
import CustomHeader from "../components/Common/customHeader/customHeader"
import CustomHeaderPromotion from "../components/Common/customHeader/customHeaderPromotion"
import InicioScreen from "../screens/Core/homeScreen/homeScreen"
import { CartProvider } from "../contexts/CartContext/cartContext"
import MobileBackHeader from "../components/Common/mobileHeader/mobileHeader"

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
  AvaliacaoForm: { pedidoId: number };
  RelatorioAvaliacoes: undefined;
  ReclamacaoForm: { vendaId: number; pessoaId: number };
  ReclamacaoAdminList: undefined;
};

// --- Navegadores ---
const Stack = createNativeStackNavigator()
const Drawer = createDrawerNavigator()

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
    getUserRole();
  }, [])

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Busca tudo que está salvo sobre o usuário
        const role = await AsyncStorage.getItem("userRole");
        const token = await AsyncStorage.getItem("userToken");
        const userId = await AsyncStorage.getItem("userId"); // Ou "user_id" ou "id" (depende de como seu LoginScreen salva)
        const userData = await AsyncStorage.getItem("userData"); // Caso tenha salvo o objeto inteiro

        console.log("\n=== QUEM ESTÁ LOGADO? ===");
        console.log("🔐 Token existe?", !!token); // True ou False
        console.log("🎭 Role (Papel):", role);
        console.log("🆔 ID Salvo:", userId);
        console.log("📄 Dados Completos:", userData);
        console.log("=========================\n");

        if (role && (role === "Admin" || role === "Fornecedor" || role === "Cliente")) {
          setUserRole(role as UserRole);
        }
      } catch (error) {
        console.error("Erro ao verificar login:", error);
      }
    };

    checkLoginStatus();
  }, []);

  const menuSections: MenuSection[] = useMemo(() => {
    const menuScreens = drawerScreenConfigs.filter((screen) => screen.showInMenu !== false)
    const screensMap = menuScreens.reduce((acc, screen) => {
      acc[screen.name] = screen
      return acc
    }, {} as Record<string, MenuItem>)

    return createMenuSections(screensMap)
  }, [])

  // Filtrar seções com base no papel do usuário
  const filteredSections = menuSections
    .filter((section) => section.roles.includes(userRole))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((section) => section.items.length > 0)
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
              section.items.map((item) => (
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

interface DrawerScreenConfig extends MenuItem {
  renderDesktopHeader?: () => React.ReactNode
  renderMobileHeader?: (navigation: any) => React.ReactNode
  extraOptions?: any
  showInMenu?: boolean
}

const fallbackIcon: MenuItem["icon"] = ({ color, size }) => (
  <Ionicons name="ellipse-outline" color={color} size={size} />
)

const getIconForScreen = (name: string): MenuItem["icon"] => baseIconMap[name] ?? fallbackIcon

const drawerScreenConfigs: DrawerScreenConfig[] = [
  {
    key: "Inicio",
    name: "Inicio",
    component: InicioScreen,
    title: "Início",
    icon: getIconForScreen("Inicio"),
    roles: ["Admin", "Fornecedor", "Cliente"],
    renderDesktopHeader: () => <CustomHeader showFilter={true} />,
  },
  {
    key: "Cadastro Produto",
    name: "Cadastro Produto",
    component: ProductListScreen,
    title: "Gerenciar Produtos",
    icon: getIconForScreen("Cadastro Produto"),
    roles: ["Admin", "Fornecedor"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "PromocaoList",
    name: "PromocaoList",
    component: PromotionScreenWrapper,
    title: "Gerenciar Promoções",
    icon: getIconForScreen("PromocaoList"),
    roles: ["Admin", "Fornecedor"],
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "LoteList",
    name: "LoteList",
    component: LotListScreen,
    title: "Listagem de lotes",
    icon: getIconForScreen("LoteList"),
    roles: ["Admin", "Fornecedor"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "LoteForm",
    name: "LoteForm",
    component: LotFormScreen,
    title: "Formulário de lotes",
    icon: getIconForScreen("LoteForm"),
    roles: ["Admin", "Fornecedor"],
    showInMenu: false,
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "Cadastro Categoria",
    name: "Cadastro Categoria",
    component: CategoriaListScreen,
    title: "Gerenciar Categorias",
    icon: getIconForScreen("Cadastro Categoria"),
    roles: ["Admin"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "Cadastro Marca",
    name: "Cadastro Marca",
    component: MarcaListScreen,
    title: "Gerenciar Marcas",
    icon: getIconForScreen("Cadastro Marca"),
    roles: ["Admin"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "Cadastro Tipo",
    name: "Cadastro Tipo",
    component: TipoListScreen,
    title: "Gerenciar Tipos",
    icon: getIconForScreen("Cadastro Tipo"),
    roles: ["Admin"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "Aprovacao de Produtos",
    name: "Aprovacao de Produtos",
    component: AprovacaoListScreen,
    title: "Aprovar Produtos",
    icon: getIconForScreen("Aprovacao de Produtos"),
    roles: ["Admin"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "EstadoList",
    name: "EstadoList",
    component: EstadoListScreen,
    title: "Gerenciar Estados",
    icon: getIconForScreen("EstadoList"),
    roles: ["Admin"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "CidadeList",
    name: "CidadeList",
    component: CidadeListScreen,
    title: "Gerenciar Cidades",
    icon: getIconForScreen("CidadeList"),
    roles: ["Admin"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "PessoaList",
    name: "PessoaList",
    component: UserListScreen,
    title: "Gerenciar Usuários",
    icon: getIconForScreen("PessoaList"),
    roles: ["Admin"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "Entregas", // Tela de Meus Pedidos
    name: "Entregas", // Deve bater com o nome no Stack.Screen
    component: EntregasScreen,
    title: "Meus Pedidos",
    icon: getIconForScreen("Entregas"), // Você precisará adicionar um ícone no menuConfig.ts
    roles: ["Cliente", "Admin"], // Quem pode ver no menu
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "DeliverySimulation", // Tela de Admin
    name: "DeliverySimulation", // Deve bater com o nome no Stack.Screen
    component: DeliverySimulationScreen,
    title: "Simulador de Definir Entrega",
    icon: getIconForScreen("DeliverySimulation"), // Adicionar ícone no menuConfig
    roles: ["Admin", "Fornecedor", "Cliente"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "ReclamacaoList", // Tela de Admin
    name: "ReclamacaoAdminList", // Deve bater com o nome no Stack.Screen
    component: ReclamacaoAdminListScreen,
    title: "Gerenciar Reclamações",
    icon: getIconForScreen("ReclamacaoList"), // Adicionar ícone no menuConfig
    roles: ["Admin"], // Apenas Admin vê no menu
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "Relatorios",
    name: "Relatorios",
    component: RelatoriosScreen,
    title: "Relatórios",
    icon: getIconForScreen("Relatorios"),
    roles: ["Admin"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "Configuracoes",
    name: "Configuracoes",
    component: ConfigScreen,
    title: "Configurações",
    icon: getIconForScreen("Configuracoes"),
    roles: ["Admin", "Fornecedor", "Cliente"],
    renderDesktopHeader: () => <CustomHeader />,
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
  {
    key: "Sair",
    name: "Sair",
    component: LogoutScreen,
    title: "Sair",
    icon: getIconForScreen("Sair"),
    roles: ["Admin", "Fornecedor", "Cliente"],
    showInMenu: false,
    extraOptions: { drawerItemStyle: { display: "none" } },
    renderMobileHeader: (navigation) => <MobileBackHeader onBack={() => navigation.navigate("Inicio")} />,
  },
]

// --- Componente que define o Drawer Navigator ---
const MainAppDrawer = () => {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 768

  return (
    <Drawer.Navigator
      initialRouteName="Inicio"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: "#4CAF50",
        drawerInactiveTintColor: "white",
        drawerLabelStyle: { color: "white", fontSize: 16, marginLeft: 5 },
        drawerStyle: { backgroundColor: "#2F4F4F", width: isDesktop ? undefined : '100%' },
        drawerType: isDesktop ? 'slide' : 'front',
        overlayColor: isDesktop ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.45)',
        headerShown: false,
      }}
    >
      {drawerScreenConfigs.map((screen) => (
        <Drawer.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={({ navigation }) => {
            const options: any = {
              title: screen.title,
              drawerIcon: screen.icon,
              ...(screen.extraOptions || {}),
            }

            if (isDesktop) {
              if (screen.renderDesktopHeader) {
                options.headerShown = true
                options.header = () => screen.renderDesktopHeader!()
              } else if (options.headerShown === undefined) {
                options.headerShown = false
              }
            } else {
              if (screen.renderMobileHeader) {
                options.headerShown = true
                options.header = () => screen.renderMobileHeader!(navigation)
              } else if (options.headerShown === undefined) {
                options.headerShown = false
              }
            }

            return options
          }}
        />
      ))}
    </Drawer.Navigator>
  )
}

// --- Navegador Principal da Aplicação ---
const AppNavigator = () => {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 768

  return (
    <SafeAreaProvider>
      <SearchProvider>
        <CartProvider>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={({ navigation, route }) => {
              if (isDesktop) {
                return {}
              }

              if (route.name === "Login" || route.name === "Dashboard") {
                return { headerShown: false }
              }

              return {
                headerShown: true,
                header: () => <MobileBackHeader onBack={() => navigation.goBack()} />,
              }
            }}
          >
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
            <Stack.Screen
              name="AprovacaoDetail"
              component={AprovacaoDetailScreen}
              options={{ title: "Aprovar/Rejeitar Produto" }}
            />
            <Stack.Screen name="PessoaForm" component={UserFormScreen} options={{ title: "Editar Usuário" }} />
            <Stack.Screen name="PromocaoForm" component={PromotionFormScreen} options={{ title: "Formulário de Promoção" }} />
            <Stack.Screen name="PromocaoDetail" component={PromotionDetailScreen} options={{ title: "Detalhes da Promoção" }} />
            <Stack.Screen
              name="ShoppingCart"
              component={ShoppingCartScreen}
              options={{ title: "Carrinho de Compras" }}
            />
            <Stack.Screen name="Entregas" component={EntregasScreen} options={{ title: 'Meus Pedidos' }} />
            <Stack.Screen 
              name="ReclamacaoForm" 
              component={ReclamacaoFormScreen} 
              options={{ title: 'Relatar Problema' }}
            />
            <Stack.Screen 
              name="ReclamacaoAdminList" 
              component={ReclamacaoAdminListScreen} 
              options={{ title: 'Gerenciar Reclamações' }}
            />
            <Stack.Screen 
              name="RelatorioAvaliacoes" 
              component={RelatorioAvaliacoesScreen} 
              options={{ title: 'Relatório Avaliações' }}
            />
            <Stack.Screen
              name="AvaliacaoForm"
              component={AvaliacaoFormScreen}
              options={{ title: "Formulário de Avaliação" }}
            />
            <Stack.Screen 
              name="DeliverySimulation" 
              component={DeliverySimulationScreen} 
              options={{ title: 'Definir Entrega' }} 
            />
          </Stack.Navigator>
        </CartProvider>
      </SearchProvider>
    </SafeAreaProvider>
  )
}

export default AppNavigator