"use client"

// src/navigation/AppNavigator.tsx
import type React from "react"
import { useState, useEffect } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createDrawerNavigator } from "@react-navigation/drawer"
import { Ionicons } from "@expo/vector-icons"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'

import LoginScreen from "../screens/Auth/LoginScreen"
import CadastroScreen from "../screens/Auth/CadastroScreen"
import LogoutScreen from "../screens/Auth/LogoutScreen"
import InicioScreen from "../screens/Core/InicioScreen"
import ConfigScreen from "../screens/Core/configScreen"
import RelatoriosScreen from "../screens/Reports/relatoriosScreen"
import EstadoListScreen from "../screens/Location/EstadoListScreen"
import EstadoFormScreen from "../screens/Location/EstadoFormScreen"
import CidadeListScreen from "../screens/Location/CidadeListScreen"
import CidadeFormScreen from "../screens/Location/CidadeFormScreen"
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
import PessoaListScreen from "../screens/User/PessoaListScreen"
import PessoaFormScreen from "../screens/User/PessoaFormScreen"

import PromocaoListScreen from '../screens/Promotions/PromocaoListScreen'
import PromocaoDetailScreen from '../screens/Promotions/PromocaoDetailScreen'
import PromocaoFormScreen from '../screens/Promotions/PromocaoFormScreen'
import LoteFormScreen from "../screens/Lotes/LoteFormScreen"
import LoteListScreen from "../screens/Lotes/LoteListScreen"

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
          component: PromocaoListScreen,
          title: 'Gerenciar Promoções', 
          icon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
          roles: ["Admin", "Fornecedor"],
       },
        {
          key: "LoteList",
          name: "LoteList",
          component: LoteListScreen,
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
          component: PessoaListScreen,
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
    
    <SafeAreaView style={[styles.drawerContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>ConsumaJá!</Text>
        <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.menuScrollView}>
        {filteredSections.map((section, sectionIndex) => (
          <View key={`section-${sectionIndex}`}>
            {section.title !== "Geral" && (
              <View style={styles.sectionHeader}>
                {section.isDropdown ? (
                  <TouchableOpacity style={styles.dropdownHeader} onPress={() => toggleSection(section.title)}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Ionicons
                      name={expandedSections[section.title] ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.sectionTitle}>{section.title}</Text>
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
                      styles.menuItem,
                      section.isDropdown && styles.submenuItem,
                      props.state.routes[props.state.index].name === item.name && styles.activeMenuItem,
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
                        styles.menuItemText,
                        props.state.routes[props.state.index].name === item.name && styles.activeMenuItemText,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}

            {sectionIndex < filteredSections.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>

      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => props.navigation.navigate("Sair")}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Sair</Text>
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
      component={PromocaoListScreen} 
      options={{ 
        title:'Gerenciar Promoções', 
        drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
       }} 
    />,
    <Drawer.Screen 
      key="PromocaoForm" 
      name="PromocaoForm" 
      component={PromocaoFormScreen} 
      options={{ 
        title:'Gerenciar Promoções', 
        drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
       }} 
    />,
    <Drawer.Screen 
      key="PromocaoDetail" 
      name="PromocaoDetail" 
      component={PromocaoDetailScreen} 
      options={{ 
        title:'Detalhes das Promoções', 
        drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
       }} 
    />,
    <Drawer.Screen 
      key="LoteList" 
      name="LoteList" 
      component={LoteListScreen} 
      options={{ 
        title:'Listagem de lotes', 
        drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
       }} 
    />,
    <Drawer.Screen 
      key="LoteForm" 
      name="LoteForm" 
      component={LoteFormScreen} 
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
      component={PessoaListScreen}
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
        <Stack.Screen name="CidadeForm" component={CidadeFormScreen} options={{ title: "Formulário de Cidade" }} />
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
        <Stack.Screen name="PessoaForm" component={PessoaFormScreen} options={{ title: "Editar Usuário" }} />
      </Stack.Navigator>
    </SafeAreaProvider>
  )
}

// --- Estilos ---
const styles = StyleSheet.create({
  // Estilos para o drawer personalizado
  drawerContainer: {
    flex: 1,
    backgroundColor: "#2F4F4F",
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16, // Aumenta o padding no Android
    backgroundColor: "#4CAF50",
  },
  drawerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  menuScrollView: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  submenuItem: {
    paddingLeft: 32, // Mais indentado para itens do dropdown
  },
  activeMenuItem: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  menuItemText: {
    color: "white",
    fontSize: 16,
    marginLeft: 16,
  },
  activeMenuItemText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#555",
    marginVertical: 8,
    marginHorizontal: 16,
  },
  logoutButtonContainer: {
    paddingBottom: Platform.OS === 'android' ? 20 : 10, // Adiciona padding extra no Android
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#555",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    marginLeft: 16,
  },

  // Estilos originais para LogoutScreen
  logoutContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    marginBottom: 8
  },
})

export default AppNavigator