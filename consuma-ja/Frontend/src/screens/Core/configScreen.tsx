"use client"

import React from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { configStyles } from "../../common/styles/Core/configScreen.styled"
import { useConfig } from "../../contexts/ConfigContext/configContext"
import { PerfilTab } from "../../components/Config/PerfilTab"
import { EnderecoTab } from "../../components/Config/EnderecoTab"
import { NotificacoesTab } from "../../components/Config/NotificacoesTab"
import { SegurancaTab } from "../../components/Config/SegurancaTab"
import { PagamentoTab } from "../../components/Config/PagamentoTab"
import CustomHeader from "../../components/Common/customHeader/customHeader"

const ConfigScreen = () => {
  const navigation = useNavigation<any>()

  // Usar o contexto
  const {
    activeTab,
    setActiveTab,
    loadingData,
    errors,
    loadUserData,
  } = useConfig()

  // Carregar dados do usuário quando a tela for focada
  useFocusEffect(
    React.useCallback(() => {
      loadUserData()
    }, [loadUserData])
  )

  // Renderização de loading
  if (loadingData) {
    return (
      <View style={configStyles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={configStyles.loadingText}>Carregando configurações...</Text>
      </View>
    )
  }

  // Renderização de erro
  if (errors.form) {
    return (
      <View style={configStyles.centered}>
        <Text style={configStyles.errorText}>{errors.form}</Text>
        <TouchableOpacity style={[configStyles.button, configStyles.retryButton]} onPress={() => navigation.goBack()}>
          <Text style={configStyles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Renderização principal
  return (
    <View style={configStyles.mainContainer}>
      {/* Header com botão hambúrguer */}
      <CustomHeader hideSearchBar={true} />

      {/* Container do título */}
      <View style={configStyles.header}>
        <Text style={configStyles.headerTitle}>Configurações</Text>
      </View>

      {/* Navegação por abas */}
      <View style={configStyles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[configStyles.tabButton, activeTab === "perfil" && configStyles.activeTabButton]}
            onPress={() => setActiveTab("perfil")}
          >
            <Ionicons name="person-outline" size={20} color={activeTab === "perfil" ? "#FFFFFF" : "#4CAF50"} />
            <Text style={[configStyles.tabText, activeTab === "perfil" && configStyles.activeTabText]}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[configStyles.tabButton, activeTab === "endereco" && configStyles.activeTabButton]}
            onPress={() => setActiveTab("endereco")}
          >
            <Ionicons name="location-outline" size={20} color={activeTab === "endereco" ? "#FFFFFF" : "#4CAF50"} />
            <Text style={[configStyles.tabText, activeTab === "endereco" && configStyles.activeTabText]}>Endereço</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[configStyles.tabButton, activeTab === "notificacoes" && configStyles.activeTabButton]}
            onPress={() => setActiveTab("notificacoes")}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={activeTab === "notificacoes" ? "#FFFFFF" : "#4CAF50"}
            />
            <Text style={[configStyles.tabText, activeTab === "notificacoes" && configStyles.activeTabText]}>Notificações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[configStyles.tabButton, activeTab === "seguranca" && configStyles.activeTabButton]}
            onPress={() => setActiveTab("seguranca")}
          >
            <Ionicons name="shield-outline" size={20} color={activeTab === "seguranca" ? "#FFFFFF" : "#4CAF50"} />
            <Text style={[configStyles.tabText, activeTab === "seguranca" && configStyles.activeTabText]}>Segurança</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[configStyles.tabButton, activeTab === "pagamento" && configStyles.activeTabButton]}
            onPress={() => setActiveTab("pagamento")}
          >
            <Ionicons name="card-outline" size={20} color={activeTab === "pagamento" ? "#FFFFFF" : "#4CAF50"} />
            <Text style={[configStyles.tabText, activeTab === "pagamento" && configStyles.activeTabText]}>Pagamento</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Conteúdo das abas */}
      <ScrollView contentContainerStyle={configStyles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={configStyles.container}>
          {/* Aba de Perfil */}
          {activeTab === "perfil" && <PerfilTab />}

          {/* Aba de Endereço */}
          {activeTab === "endereco" && <EnderecoTab />}

          {/* Aba de Notificações */}
          {activeTab === "notificacoes" && <NotificacoesTab />}

          {/* Aba de Segurança */}
          {activeTab === "seguranca" && <SegurancaTab />}

          {/* Aba de Pagamento */}
          {activeTab === "pagamento" && <PagamentoTab />}
        </View>
      </ScrollView>
    </View>
  )
}

export default ConfigScreen
