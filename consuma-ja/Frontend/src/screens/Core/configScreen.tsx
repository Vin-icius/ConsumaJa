"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  Platform,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
// Importações de serviços que podem ser necessárias
// import pessoaService from '../../services/pessoaService';
// import locationService from '../../services/locationService';

// Tipos
type PessoaTipo = "Fisica" | "Juridica" | "Admin" | ""
type TabType = "perfil" | "endereco" | "notificacoes" | "seguranca" | "pagamento"

// Funções de formatação
const formatCPF = (value: string): string => {
  value = value.replace(/\D/g, "").slice(0, 11)
  if (value.length <= 3) return value
  if (value.length <= 6) return value.replace(/(\d{3})(\d{1,})/, "$1.$2")
  if (value.length <= 9) return value.replace(/(\d{3})(\d{3})(\d{1,})/, "$1.$2.$3")
  return value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,})/, "$1.$2.$3-$4")
}

const formatCNPJ = (value: string): string => {
  value = value.replace(/\D/g, "").slice(0, 14)
  if (value.length <= 2) return value
  if (value.length <= 5) return value.replace(/(\d{2})(\d{1,})/, "$1.$2")
  if (value.length <= 8) return value.replace(/(\d{2})(\d{3})(\d{1,})/, "$1.$2.$3")
  if (value.length <= 12) return value.replace(/(\d{2})(\d{3})(\d{3})(\d{1,})/, "$1.$2.$3/$4")
  return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,})/, "$1.$2.$3/$4-$5")
}

const formatTelefone = (value: string): string => {
  const c = value.replace(/\D/g, "").slice(0, 11)
  let f = c
  if (c.length > 2) {
    f = `(${c.substring(0, 2)}) ${c.substring(2)}`
  }
  if (c.length > 6) {
    f = `(${c.substring(0, 2)}) ${c.substring(2, c.length > 10 ? 7 : 6)}-${c.substring(c.length > 10 ? 7 : 6)}`
  }
  if (c.length > 10) {
    f = `(${c.substring(0, 2)}) ${c.substring(2, 7)}-${c.substring(7, 11)}`
  } else if (c.length > 6) {
    f = `(${c.substring(0, 2)}) ${c.substring(2, 6)}-${c.substring(6, 10)}`
  }
  return f
}

const formatCEP = (value: string): string => {
  const cleaned = value.replace(/\D/g, "").slice(0, 8)
  if (cleaned.length > 5) return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
  return cleaned
}

const ConfigScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const userId = route.params?.userId || 1 // ID do usuário, padrão 1 se não fornecido

  // Estados para abas
  const [activeTab, setActiveTab] = useState<TabType>("perfil")

  // Estados para perfil
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [tipoUsuario, setTipoUsuario] = useState<PessoaTipo>("Fisica")
  const [cpf, setCpf] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [fornecedorNum, setFornecedorNum] = useState("")

  // Estados para endereço
  const [cep, setCep] = useState("")
  const [rua, setRua] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")
  const [cidadeId, setCidadeId] = useState<number | null>(null)

  // Estados para notificações
  const [emailNotificacoes, setEmailNotificacoes] = useState(true)
  const [smsNotificacoes, setSmsNotificacoes] = useState(false)
  const [marketingNotificacoes, setMarketingNotificacoes] = useState(true)

  // Estados de controle
  const [loadingData, setLoadingData] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Busca dados do usuário ao carregar
  useEffect(() => {
    let isMounted = true

    const fetchUsuario = async () => {
      setLoadingData(true)
      setErrors({})

      try {
        // Simulando busca de dados do usuário
        // Em um caso real, você usaria algo como:
        // const data = await pessoaService.buscarPessoaPorId(userId);

        // Dados simulados para demonstração
        setTimeout(() => {
          if (isMounted) {
            setNome("João Silva")
            setEmail("joao.silva@exemplo.com")
            setTelefone("(11) 98765-4321")
            setTipoUsuario("Fisica")
            setCpf("123.456.789-00")

            setCep("01234-567")
            setRua("Rua das Flores")
            setNumero("123")
            setBairro("Jardim Primavera")
            setCidade("São Paulo")
            setEstado("SP")

            setLoadingData(false)
          }
        }, 1000)
      } catch (error: any) {
        console.error("Erro ao buscar usuário:", error)
        if (isMounted) {
          setErrors({ form: "Erro ao carregar dados do usuário." })
          setLoadingData(false)
        }
      }
    }

    fetchUsuario()
    return () => {
      isMounted = false
    }
  }, [userId])

  // Validação de perfil
  const validarPerfil = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!nome.trim()) newErrors.nome = "Nome obrigatório"
    if (!email.includes("@")) newErrors.email = "Email inválido"
    if (!telefone || telefone.replace(/\D/g, "").length < 10) newErrors.telefone = "Telefone inválido"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validação de endereço
  const validarEndereco = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!cep || cep.replace(/\D/g, "").length !== 8) newErrors.cep = "CEP inválido"
    if (!rua.trim()) newErrors.rua = "Rua obrigatória"
    if (!numero.trim()) newErrors.numero = "Número obrigatório"
    if (!bairro.trim()) newErrors.bairro = "Bairro obrigatório"
    if (!cidade.trim()) newErrors.cidade = "Cidade obrigatória"
    if (!estado.trim()) newErrors.estado = "Estado obrigatório"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Busca CEP
  const handleCepBlur = useCallback(async () => {
    const cepLimpo = cep.replace(/\D/g, "")
    if (!cepLimpo || cepLimpo.length !== 8) return

    Keyboard.dismiss()
    setLoadingCep(true)
    setErrors((prev) => ({
      ...prev,
      cep: undefined,
      rua: undefined,
      bairro: undefined,
      cidade: undefined,
      estado: undefined,
    }))

    try {
      // Em um caso real, você usaria:
      // const response = await locationService.lookupCep(cepLimpo);
      // const address = response.data;

      // Simulando resposta da API de CEP
      setTimeout(() => {
        setRua("Avenida Paulista")
        setBairro("Bela Vista")
        setCidade("São Paulo")
        setEstado("SP")
        setCidadeId(1)
        setLoadingCep(false)
      }, 1000)
    } catch (error: any) {
      console.error("Erro ao buscar CEP:", error)
      setErrors((prev) => ({ ...prev, cep: "CEP não encontrado" }))
      setLoadingCep(false)
    }
  }, [cep])

  // Submit do perfil
  const handleSubmitPerfil = async () => {
    Keyboard.dismiss()
    if (!validarPerfil()) {
      Alert.alert("Erro", "Verifique os campos.")
      return
    }

    setLoadingSubmit(true)

    try {
      // Simulando envio para API
      setTimeout(() => {
        Alert.alert("Sucesso", "Perfil atualizado com sucesso!")
        setLoadingSubmit(false)
      }, 1000)
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)
      Alert.alert("Erro", "Não foi possível atualizar o perfil.")
      setLoadingSubmit(false)
    }
  }

  // Submit do endereço
  const handleSubmitEndereco = async () => {
    Keyboard.dismiss()
    if (!validarEndereco()) {
      Alert.alert("Erro", "Verifique os campos.")
      return
    }

    setLoadingSubmit(true)

    try {
      // Simulando envio para API
      setTimeout(() => {
        Alert.alert("Sucesso", "Endereço atualizado com sucesso!")
        setLoadingSubmit(false)
      }, 1000)
    } catch (error: any) {
      console.error("Erro ao atualizar endereço:", error)
      Alert.alert("Erro", "Não foi possível atualizar o endereço.")
      setLoadingSubmit(false)
    }
  }

  // Submit das notificações
  const handleSubmitNotificacoes = async () => {
    setLoadingSubmit(true)

    try {
      // Simulando envio para API
      setTimeout(() => {
        Alert.alert("Sucesso", "Preferências de notificação atualizadas!")
        setLoadingSubmit(false)
      }, 1000)
    } catch (error: any) {
      console.error("Erro ao atualizar notificações:", error)
      Alert.alert("Erro", "Não foi possível atualizar as preferências.")
      setLoadingSubmit(false)
    }
  }

  // Renderização de loading
  if (loadingData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando configurações...</Text>
      </View>
    )
  }

  // Renderização de erro
  if (errors.form) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errors.form}</Text>
        <TouchableOpacity style={[styles.button, styles.retryButton]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Renderização principal
  return (
    <View style={styles.mainContainer}>
      {/* Cabeçalho com título */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      {/* Navegação por abas */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "perfil" && styles.activeTabButton]}
            onPress={() => setActiveTab("perfil")}
          >
            <Ionicons name="person-outline" size={20} color={activeTab === "perfil" ? "#FFFFFF" : "#4CAF50"} />
            <Text style={[styles.tabText, activeTab === "perfil" && styles.activeTabText]}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "endereco" && styles.activeTabButton]}
            onPress={() => setActiveTab("endereco")}
          >
            <Ionicons name="location-outline" size={20} color={activeTab === "endereco" ? "#FFFFFF" : "#4CAF50"} />
            <Text style={[styles.tabText, activeTab === "endereco" && styles.activeTabText]}>Endereço</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "notificacoes" && styles.activeTabButton]}
            onPress={() => setActiveTab("notificacoes")}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={activeTab === "notificacoes" ? "#FFFFFF" : "#4CAF50"}
            />
            <Text style={[styles.tabText, activeTab === "notificacoes" && styles.activeTabText]}>Notificações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "seguranca" && styles.activeTabButton]}
            onPress={() => setActiveTab("seguranca")}
          >
            <Ionicons name="shield-outline" size={20} color={activeTab === "seguranca" ? "#FFFFFF" : "#4CAF50"} />
            <Text style={[styles.tabText, activeTab === "seguranca" && styles.activeTabText]}>Segurança</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "pagamento" && styles.activeTabButton]}
            onPress={() => setActiveTab("pagamento")}
          >
            <Ionicons name="card-outline" size={20} color={activeTab === "pagamento" ? "#FFFFFF" : "#4CAF50"} />
            <Text style={[styles.tabText, activeTab === "pagamento" && styles.activeTabText]}>Pagamento</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Conteúdo das abas */}
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* Aba de Perfil */}
          {activeTab === "perfil" && (
            <>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome Completo:</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled, errors.nome && styles.inputError]}
                  value={nome}
                  autoCapitalize="words"
                  editable={false}
                />
                {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
              </View>

              {/* Campo de CPF/CNPJ não editável */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {tipoUsuario === "Fisica" ? "CPF:" : tipoUsuario === "Juridica" ? "CNPJ:" : "Documento:"}
                </Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={tipoUsuario === "Fisica" ? cpf : tipoUsuario === "Juridica" ? cnpj : ""}
                  editable={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email:</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seuemail@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefone:</Text>
                <TextInput
                  style={[styles.input, errors.telefone && styles.inputError]}
                  value={telefone}
                  onChangeText={(v) => setTelefone(formatTelefone(v))}
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
                {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
              </View>

              {/* Exibir número de fornecedor apenas se for pessoa jurídica */}
              {tipoUsuario === "Juridica" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nº Fornecedor:</Text>
                  <TextInput style={[styles.input, styles.inputDisabled]} value={fornecedorNum} editable={false} />
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, styles.saveButton, loadingSubmit && styles.buttonDisabled]}
                onPress={handleSubmitPerfil}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Salvar Perfil</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Aba de Endereço */}
          {activeTab === "endereco" && (
            <>
              <Text style={styles.sectionTitle}>Endereço de Entrega</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CEP:</Text>
                <View style={styles.rowContainer}>
                  <TextInput
                    style={[styles.input, styles.flexGrow, errors.cep && styles.inputError]}
                    value={cep}
                    onChangeText={(v) => setCep(formatCEP(v))}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    keyboardType="numeric"
                    maxLength={9}
                  />
                  {loadingCep && <ActivityIndicator size="small" color="#4CAF50" style={styles.inputIcon} />}
                </View>
                {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rua:</Text>
                <TextInput
                  style={[styles.input, errors.rua && styles.inputError]}
                  value={rua}
                  onChangeText={setRua}
                  placeholder="Nome da rua"
                />
                {errors.rua && <Text style={styles.errorText}>{errors.rua}</Text>}
              </View>

              <View style={styles.rowGroup}>
                <View style={[styles.inputGroup, styles.flex1, styles.marginRight]}>
                  <Text style={styles.label}>Número:</Text>
                  <TextInput
                    style={[styles.input, errors.numero && styles.inputError]}
                    value={numero}
                    onChangeText={setNumero}
                    placeholder="Número"
                    keyboardType="numeric"
                  />
                  {errors.numero && <Text style={styles.errorText}>{errors.numero}</Text>}
                </View>

                <View style={[styles.inputGroup, styles.flex2]}>
                  <Text style={styles.label}>Complemento:</Text>
                  <TextInput
                    style={styles.input}
                    value={complemento}
                    onChangeText={setComplemento}
                    placeholder="Apto, bloco, etc. (opcional)"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bairro:</Text>
                <TextInput
                  style={[styles.input, errors.bairro && styles.inputError]}
                  value={bairro}
                  onChangeText={setBairro}
                  placeholder="Bairro"
                />
                {errors.bairro && <Text style={styles.errorText}>{errors.bairro}</Text>}
              </View>

              <View style={styles.rowGroup}>
                <View style={[styles.inputGroup, styles.flex2, styles.marginRight]}>
                  <Text style={styles.label}>Cidade:</Text>
                  <TextInput
                    style={[styles.input, errors.cidade && styles.inputError]}
                    value={cidade}
                    onChangeText={setCidade}
                    placeholder="Cidade"
                  />
                  {errors.cidade && <Text style={styles.errorText}>{errors.cidade}</Text>}
                </View>

                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Estado:</Text>
                  <TextInput
                    style={[styles.input, errors.estado && styles.inputError]}
                    value={estado}
                    onChangeText={setEstado}
                    placeholder="UF"
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                  {errors.estado && <Text style={styles.errorText}>{errors.estado}</Text>}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.saveButton, loadingSubmit && styles.buttonDisabled]}
                onPress={handleSubmitEndereco}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Salvar Endereço</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Aba de Notificações */}
          {activeTab === "notificacoes" && (
            <>
              <Text style={styles.sectionTitle}>Preferências de Notificação</Text>

              <View style={styles.switchContainer}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Notificações por Email</Text>
                  <Text style={styles.switchDescription}>Receba atualizações sobre seus pedidos por email</Text>
                </View>
                <TouchableOpacity
                  style={[styles.switchButton, emailNotificacoes && styles.switchButtonActive]}
                  onPress={() => setEmailNotificacoes(!emailNotificacoes)}
                >
                  <View style={[styles.switchKnob, emailNotificacoes && styles.switchKnobActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.switchContainer}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Notificações por SMS</Text>
                  <Text style={styles.switchDescription}>Receba atualizações sobre seus pedidos por SMS</Text>
                </View>
                <TouchableOpacity
                  style={[styles.switchButton, smsNotificacoes && styles.switchButtonActive]}
                  onPress={() => setSmsNotificacoes(!smsNotificacoes)}
                >
                  <View style={[styles.switchKnob, smsNotificacoes && styles.switchKnobActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.switchContainer}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Marketing</Text>
                  <Text style={styles.switchDescription}>Receba ofertas especiais e novidades</Text>
                </View>
                <TouchableOpacity
                  style={[styles.switchButton, marketingNotificacoes && styles.switchButtonActive]}
                  onPress={() => setMarketingNotificacoes(!marketingNotificacoes)}
                >
                  <View style={[styles.switchKnob, marketingNotificacoes && styles.switchKnobActive]} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.saveButton, loadingSubmit && styles.buttonDisabled]}
                onPress={handleSubmitNotificacoes}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Salvar Preferências</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Aba de Segurança */}
          {activeTab === "seguranca" && (
            <>
              <Text style={styles.sectionTitle}>Alterar Senha</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha Atual:</Text>
                <TextInput style={styles.input} placeholder="Sua senha atual" secureTextEntry />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nova Senha:</Text>
                <TextInput style={styles.input} placeholder="Nova senha" secureTextEntry />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Nova Senha:</Text>
                <TextInput style={styles.input} placeholder="Confirme a nova senha" secureTextEntry />
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Segurança Adicional</Text>

              <View style={styles.switchContainer}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Autenticação de Dois Fatores</Text>
                  <Text style={styles.switchDescription}>Adicione uma camada extra de segurança à sua conta</Text>
                </View>
                <TouchableOpacity style={[styles.switchButton, false && styles.switchButtonActive]} onPress={() => {}}>
                  <View style={[styles.switchKnob, false && styles.switchKnobActive]} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={() => Alert.alert("Segurança", "Função em desenvolvimento")}
              >
                <Text style={styles.buttonText}>Atualizar Senha</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Aba de Pagamento */}
          {activeTab === "pagamento" && (
            <>
              <Text style={styles.sectionTitle}>Métodos de Pagamento</Text>

              <View style={styles.paymentCard}>
                <View style={styles.paymentCardInfo}>
                  <View style={styles.paymentCardIcon}>
                    <Ionicons name="card-outline" size={24} color="#4CAF50" />
                  </View>
                  <View>
                    <Text style={styles.paymentCardTitle}>Cartão de Crédito</Text>
                    <Text style={styles.paymentCardNumber}>**** **** **** 4242</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.paymentCardAction}>
                  <Text style={styles.paymentCardActionText}>Remover</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.addPaymentButton}
                onPress={() => Alert.alert("Pagamento", "Função em desenvolvimento")}
              >
                <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
                <Text style={styles.addPaymentText}>Adicionar Novo Método de Pagamento</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  // Container e layout
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  rowGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flexGrow: { flexGrow: 1 },
  marginRight: { marginRight: 10 },

  // Header
  header: {
    backgroundColor: "#4CAF50",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  // Tabs
  tabContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  activeTabButton: {
    backgroundColor: "#4CAF50",
  },
  tabText: {
    marginLeft: 5,
    color: "#4CAF50",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },

  // Seções
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },

  // Formulários
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "red",
  },
  inputDisabled: {
    backgroundColor: "#e9ecef",
    color: "#6c757d",
  },
  inputIcon: {
    marginLeft: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 3,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  // Picker
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 50,
    marginTop: Platform.OS === "ios" ? -10 : 0,
  },
  pickerPlaceholder: {
    color: "grey",
  },

  // Botões
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 25,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  retryButton: {
    backgroundColor: "#757575",
    marginTop: 15,
    paddingHorizontal: 30,
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Switches
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  switchDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  switchButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    padding: 2,
  },
  switchButtonActive: {
    backgroundColor: "#4CAF50",
  },
  switchKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
  },
  switchKnobActive: {
    alignSelf: "flex-end",
  },

  // Cartões de pagamento
  paymentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentCardInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  paymentCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  paymentCardNumber: {
    fontSize: 14,
    color: "#666",
  },
  paymentCardAction: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 5,
  },
  paymentCardActionText: {
    color: "#4CAF50",
    fontSize: 14,
  },
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 8,
    borderStyle: "dashed",
    marginTop: 10,
  },
  addPaymentText: {
    color: "#4CAF50",
    marginLeft: 5,
    fontSize: 16,
  },
})

export default ConfigScreen
