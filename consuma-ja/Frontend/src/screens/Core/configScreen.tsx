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
import { configStyles } from "../../common/styles/Core/configScreen.styled"

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
    setErrors((prev) => {
      const { cep, rua, bairro, cidade, estado, ...rest } = prev
      return rest
    })

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
      {/* Cabeçalho com título */}
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
          {activeTab === "perfil" && (
            <>
              <Text style={configStyles.sectionTitle}>Informações Pessoais</Text>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Nome Completo:</Text>
                <TextInput
                  style={[configStyles.input, configStyles.inputDisabled, errors.nome && configStyles.inputError]}
                  value={nome}
                  autoCapitalize="words"
                  editable={false}
                />
                {errors.nome && <Text style={configStyles.errorText}>{errors.nome}</Text>}
              </View>

              {/* Campo de CPF/CNPJ não editável */}
              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>
                  {tipoUsuario === "Fisica" ? "CPF:" : tipoUsuario === "Juridica" ? "CNPJ:" : "Documento:"}
                </Text>
                <TextInput
                  style={[configStyles.input, configStyles.inputDisabled]}
                  value={tipoUsuario === "Fisica" ? cpf : tipoUsuario === "Juridica" ? cnpj : ""}
                  editable={false}
                />
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Email:</Text>
                <TextInput
                  style={[configStyles.input, errors.email && configStyles.inputError]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seuemail@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={configStyles.errorText}>{errors.email}</Text>}
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Telefone:</Text>
                <TextInput
                  style={[configStyles.input, errors.telefone && configStyles.inputError]}
                  value={telefone}
                  onChangeText={(v) => setTelefone(formatTelefone(v))}
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
                {errors.telefone && <Text style={configStyles.errorText}>{errors.telefone}</Text>}
              </View>

              {/* Exibir número de fornecedor apenas se for pessoa jurídica */}
              {tipoUsuario === "Juridica" && (
                <View style={configStyles.inputGroup}>
                  <Text style={configStyles.label}>Nº Fornecedor:</Text>
                  <TextInput style={[configStyles.input, configStyles.inputDisabled]} value={fornecedorNum} editable={false} />
                </View>
              )}

              <TouchableOpacity
                style={[configStyles.button, configStyles.saveButton, loadingSubmit && configStyles.buttonDisabled]}
                onPress={handleSubmitPerfil}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={configStyles.buttonText}>Salvar Perfil</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Aba de Endereço */}
          {activeTab === "endereco" && (
            <>
              <Text style={configStyles.sectionTitle}>Endereço de Entrega</Text>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>CEP:</Text>
                <View style={configStyles.rowContainer}>
                  <TextInput
                    style={[configStyles.input, configStyles.flexGrow, errors.cep && configStyles.inputError]}
                    value={cep}
                    onChangeText={(v) => setCep(formatCEP(v))}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    keyboardType="numeric"
                    maxLength={9}
                  />
                  {loadingCep && <ActivityIndicator size="small" color="#4CAF50" style={configStyles.inputIcon} />}
                </View>
                {errors.cep && <Text style={configStyles.errorText}>{errors.cep}</Text>}
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Rua:</Text>
                <TextInput
                  style={[configStyles.input, errors.rua && configStyles.inputError]}
                  value={rua}
                  onChangeText={setRua}
                  placeholder="Nome da rua"
                />
                {errors.rua && <Text style={configStyles.errorText}>{errors.rua}</Text>}
              </View>

              <View style={configStyles.rowGroup}>
                <View style={[configStyles.inputGroup, configStyles.flex1, configStyles.marginRight]}>
                  <Text style={configStyles.label}>Número:</Text>
                  <TextInput
                    style={[configStyles.input, errors.numero && configStyles.inputError]}
                    value={numero}
                    onChangeText={setNumero}
                    placeholder="Número"
                    keyboardType="numeric"
                  />
                  {errors.numero && <Text style={configStyles.errorText}>{errors.numero}</Text>}
                </View>

                <View style={[configStyles.inputGroup, configStyles.flex2]}>
                  <Text style={configStyles.label}>Complemento:</Text>
                  <TextInput
                    style={configStyles.input}
                    value={complemento}
                    onChangeText={setComplemento}
                    placeholder="Apto, bloco, etc. (opcional)"
                  />
                </View>
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Bairro:</Text>
                <TextInput
                  style={[configStyles.input, errors.bairro && configStyles.inputError]}
                  value={bairro}
                  onChangeText={setBairro}
                  placeholder="Bairro"
                />
                {errors.bairro && <Text style={configStyles.errorText}>{errors.bairro}</Text>}
              </View>

              <View style={configStyles.rowGroup}>
                <View style={[configStyles.inputGroup, configStyles.flex2, configStyles.marginRight]}>
                  <Text style={configStyles.label}>Cidade:</Text>
                  <TextInput
                    style={[configStyles.input, errors.cidade && configStyles.inputError]}
                    value={cidade}
                    onChangeText={setCidade}
                    placeholder="Cidade"
                  />
                  {errors.cidade && <Text style={configStyles.errorText}>{errors.cidade}</Text>}
                </View>

                <View style={[configStyles.inputGroup, configStyles.flex1]}>
                  <Text style={configStyles.label}>Estado:</Text>
                  <TextInput
                    style={[configStyles.input, errors.estado && configStyles.inputError]}
                    value={estado}
                    onChangeText={setEstado}
                    placeholder="UF"
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                  {errors.estado && <Text style={configStyles.errorText}>{errors.estado}</Text>}
                </View>
              </View>

              <TouchableOpacity
                style={[configStyles.button, configStyles.saveButton, loadingSubmit && configStyles.buttonDisabled]}
                onPress={handleSubmitEndereco}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={configStyles.buttonText}>Salvar Endereço</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Aba de Notificações */}
          {activeTab === "notificacoes" && (
            <>
              <Text style={configStyles.sectionTitle}>Preferências de Notificação</Text>

              <View style={configStyles.switchContainer}>
                <View style={configStyles.switchInfo}>
                  <Text style={configStyles.switchLabel}>Notificações por Email</Text>
                  <Text style={configStyles.switchDescription}>Receba atualizações sobre seus pedidos por email</Text>
                </View>
                <TouchableOpacity
                  style={[configStyles.switchButton, emailNotificacoes && configStyles.switchButtonActive]}
                  onPress={() => setEmailNotificacoes(!emailNotificacoes)}
                >
                  <View style={[configStyles.switchKnob, emailNotificacoes && configStyles.switchKnobActive]} />
                </TouchableOpacity>
              </View>

              <View style={configStyles.divider} />

              <View style={configStyles.switchContainer}>
                <View style={configStyles.switchInfo}>
                  <Text style={configStyles.switchLabel}>Notificações por SMS</Text>
                  <Text style={configStyles.switchDescription}>Receba atualizações sobre seus pedidos por SMS</Text>
                </View>
                <TouchableOpacity
                  style={[configStyles.switchButton, smsNotificacoes && configStyles.switchButtonActive]}
                  onPress={() => setSmsNotificacoes(!smsNotificacoes)}
                >
                  <View style={[configStyles.switchKnob, smsNotificacoes && configStyles.switchKnobActive]} />
                </TouchableOpacity>
              </View>

              <View style={configStyles.divider} />

              <View style={configStyles.switchContainer}>
                <View style={configStyles.switchInfo}>
                  <Text style={configStyles.switchLabel}>Marketing</Text>
                  <Text style={configStyles.switchDescription}>Receba ofertas especiais e novidades</Text>
                </View>
                <TouchableOpacity
                  style={[configStyles.switchButton, marketingNotificacoes && configStyles.switchButtonActive]}
                  onPress={() => setMarketingNotificacoes(!marketingNotificacoes)}
                >
                  <View style={[configStyles.switchKnob, marketingNotificacoes && configStyles.switchKnobActive]} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[configStyles.button, configStyles.saveButton, loadingSubmit && configStyles.buttonDisabled]}
                onPress={handleSubmitNotificacoes}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={configStyles.buttonText}>Salvar Preferências</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Aba de Segurança */}
          {activeTab === "seguranca" && (
            <>
              <Text style={configStyles.sectionTitle}>Alterar Senha</Text>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Senha Atual:</Text>
                <TextInput style={configStyles.input} placeholder="Sua senha atual" secureTextEntry />
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Nova Senha:</Text>
                <TextInput style={configStyles.input} placeholder="Nova senha" secureTextEntry />
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Confirmar Nova Senha:</Text>
                <TextInput style={configStyles.input} placeholder="Confirme a nova senha" secureTextEntry />
              </View>

              <View style={configStyles.divider} />

              <Text style={configStyles.sectionTitle}>Segurança Adicional</Text>

              <View style={configStyles.switchContainer}>
                <View style={configStyles.switchInfo}>
                  <Text style={configStyles.switchLabel}>Autenticação de Dois Fatores</Text>
                  <Text style={configStyles.switchDescription}>Adicione uma camada extra de segurança à sua conta</Text>
                </View>
                <TouchableOpacity style={[configStyles.switchButton, false && configStyles.switchButtonActive]} onPress={() => {}}>
                  <View style={[configStyles.switchKnob, false && configStyles.switchKnobActive]} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[configStyles.button, configStyles.saveButton]}
                onPress={() => Alert.alert("Segurança", "Função em desenvolvimento")}
              >
                <Text style={configStyles.buttonText}>Atualizar Senha</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Aba de Pagamento */}
          {activeTab === "pagamento" && (
            <>
              <Text style={configStyles.sectionTitle}>Métodos de Pagamento</Text>

              <View style={configStyles.paymentCard}>
                <View style={configStyles.paymentCardInfo}>
                  <View style={configStyles.paymentCardIcon}>
                    <Ionicons name="card-outline" size={24} color="#4CAF50" />
                  </View>
                  <View>
                    <Text style={configStyles.paymentCardTitle}>Cartão de Crédito</Text>
                    <Text style={configStyles.paymentCardNumber}>**** **** **** 4242</Text>
                  </View>
                </View>
                <TouchableOpacity style={configStyles.paymentCardAction}>
                  <Text style={configStyles.paymentCardActionText}>Remover</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={configStyles.addPaymentButton}
                onPress={() => Alert.alert("Pagamento", "Função em desenvolvimento")}
              >
                <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
                <Text style={configStyles.addPaymentText}>Adicionar Novo Método de Pagamento</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default ConfigScreen
