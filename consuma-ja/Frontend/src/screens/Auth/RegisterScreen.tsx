"use client"

import React, { useState, useEffect, useCallback } from "react"
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
  Image,
  Platform,
  Animated,
  Dimensions,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import * as ImagePicker from "expo-image-picker"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import pessoaService from "../../services/pessoaService"
import locationService from "../../services/locationService"
import { registerStyles } from "../../common/styles/Auth/registerScreen.styled"

// --- Tipos ---
type PessoaTipo = "Fisica" | "Juridica" | "Admin" | ""
interface CadastroFormData {
  pessoa_nome: string
  pessoa_email: string
  pessoa_telefone: string
  pessoa_tipo: PessoaTipo
  pessoa_login: string
  pessoa_senha: string
  confirmar_senha: string
  cep: string
  rua: string
  bairro: string
  numero: string
  complemento: string
  cidade: string
  estado: string
  CIDADE_cidade_id: number | null
  pessoa_cpf: string
  cnpj: string
  fornecedor_num: string
}

// --- Funções Auxiliares de Formatação ---
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

// --- Componente Principal ---
const CadastroScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()

  // Animações
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const slideAnim = React.useRef(new Animated.Value(50)).current

  // --- Estados ---
  const [formData, setFormData] = useState<CadastroFormData>({
    pessoa_nome: "",
    pessoa_email: "",
    pessoa_telefone: "",
    pessoa_tipo: "",
    pessoa_login: "",
    pessoa_senha: "",
    confirmar_senha: "",
    cep: "",
    rua: "",
    bairro: "",
    numero: "",
    complemento: "",
    cidade: "",
    estado: "",
    CIDADE_cidade_id: null,
    pessoa_cpf: "",
    cnpj: "",
    fornecedor_num: "",
  })
  const [selfieUri, setSelfieUri] = useState<string | null>(null)
  const [documentoUri, setDocumentoUri] = useState<string | null>(null)
  const [loadingCep, setLoadingCep] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [errors, setErrors] = useState<
    Partial<Record<keyof CadastroFormData | "form" | "selfie" | "documento", string>>
  >({})
  const [activeSection, setActiveSection] = useState<"pessoal" | "documento" | "endereco" | "validacao">("pessoal")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Efeito de animação ao montar o componente
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // --- Permissões ---
  useEffect(() => {
    ;(async () => {
      if (Platform.OS !== "web") {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync()
        if (cameraStatus.status !== "granted") {
          Alert.alert("Permissão Negada", "Acesso à câmera é necessário.")
        }
      }
    })()
  }, [])

  // --- Handlers ---
  const handleInputChange = useCallback(
    (field: keyof CadastroFormData, value: string | PessoaTipo) => {
      let formattedValue: any = value
      if (typeof value === "string") {
        // Aplica formatação apenas se for string
        if (field === "pessoa_cpf") formattedValue = formatCPF(value)
        else if (field === "cnpj") formattedValue = formatCNPJ(value)
        else if (field === "pessoa_telefone") formattedValue = formatTelefone(value)
        else if (field === "cep") formattedValue = formatCEP(value)
        else if (field === "pessoa_email") formattedValue = value.toLowerCase().trim()
        else if (field === "pessoa_login" && formData.pessoa_tipo === "Admin") formattedValue = value.replace(/\D/g, "")
        else if (field === "fornecedor_num") formattedValue = value.replace(/\D/g, "")
      }

      setFormData((prev) => ({ ...prev, [field]: formattedValue }))
      if (errors[field]) {
        setErrors((prev) => {
          const n = { ...prev }
          delete n[field]
          return n
        })
      }
    },
    [errors, formData.pessoa_tipo],
  )

  const handleCepBlur = useCallback(async () => {
    const cep = formData.cep?.replace(/\D/g, "")
    if (!cep || cep.length !== 8) {
      setFormData((prev) => ({
        ...prev,
        rua: "",
        bairro: "",
        cidade: "",
        estado: "",
        CIDADE_cidade_id: null,
      }))
      return
    }
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
      const response = await locationService.lookupCep(cep)
      console.log("Resposta completa:", JSON.stringify(response))
      const address = response.data || response || {}
      console.log("Dados do endereço:", address)
      setFormData((prev) => ({
        ...prev,
        rua: address?.logradouro || address?.rua || address?.endereco || "",
        bairro: address?.bairro || "",
        cidade: address?.cidade || "",
        estado: address?.estado || "",
        CIDADE_cidade_id: address?.cidadeId || null,
      }))
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "CEP não encontrado."
      setErrors((prev) => ({ ...prev, cep: msg }))
      setFormData((prev) => ({
        ...prev,
        rua: "",
        bairro: "",
        cidade: "",
        estado: "",
        CIDADE_cidade_id: null,
      }))
    } finally {
      setLoadingCep(false)
    }
  }, [formData.cep])

  const handlePickImage = useCallback(
    async (type: "selfie" | "documento") => {
      try {
        const result = await ImagePicker.launchCameraAsync({
          quality: 0.7,
        })
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const uri = result.assets[0].uri
          if (type === "selfie") {
            setSelfieUri(uri)
            if (errors.selfie) setErrors((prev) => ({ ...prev, selfie: undefined }))
          } else {
            setDocumentoUri(uri)
            if (errors.documento) setErrors((prev) => ({ ...prev, documento: undefined }))
          }
          Alert.alert("Foto Capturada")
        }
      } catch (error) {
        console.error("Erro capturar imagem:", error)
        Alert.alert("Erro", "Não foi possível usar a câmera.")
      }
    },
    [errors.selfie, errors.documento],
  )

  // --- Validação Final ---
  const validarFormularioCompleto = useCallback((): boolean => {
    console.log("[validarFormularioCompleto] Iniciando...")
    const newErrors: Partial<Record<keyof CadastroFormData | "form" | "selfie" | "documento", string>> = {}

    if (!formData.pessoa_nome?.trim()) newErrors.pessoa_nome = "Nome obrigatório"
    if (!formData.pessoa_email?.trim()) newErrors.pessoa_email = "Email obrigatório"
    if (!formData.pessoa_email?.includes("@")) newErrors.pessoa_email = "Email inválido"
    if (!formData.pessoa_telefone?.trim()) newErrors.pessoa_telefone = "Telefone obrigatório"
    if (!formData.pessoa_tipo) newErrors.pessoa_tipo = "Selecione o tipo de conta"
    if (!formData.pessoa_senha?.trim()) newErrors.pessoa_senha = "Senha obrigatória"
    if (formData.pessoa_senha?.length < 3) newErrors.pessoa_senha = "Senha deve ter no mínimo 3 caracteres"
    if (formData.pessoa_senha !== formData.confirmar_senha) newErrors.confirmar_senha = "Senhas não conferem"

    if (formData.pessoa_tipo === "Fisica" && !formData.pessoa_cpf?.replace(/\D/g, ""))
      newErrors.pessoa_cpf = "CPF obrigatório"
    if (formData.pessoa_tipo === "Juridica" && !formData.cnpj?.replace(/\D/g, "")) newErrors.cnpj = "CNPJ obrigatório"

    if (!formData.cep?.replace(/\D/g, "")) newErrors.cep = "CEP obrigatório"
    if (!formData.rua?.trim()) newErrors.rua = "Rua obrigatória"
    if (!formData.bairro?.trim()) newErrors.bairro = "Bairro obrigatório"
    if (!formData.numero?.trim()) newErrors.numero = "Número obrigatório"
    if (!formData.cidade?.trim()) newErrors.cidade = "Cidade obrigatória"
    if (!formData.estado?.trim()) newErrors.estado = "Estado obrigatório"

    if (formData.pessoa_tipo === "Fisica" && !selfieUri) newErrors.selfie = "Selfie obrigatória"
    if (formData.pessoa_tipo === "Fisica" && !documentoUri) newErrors.documento = "Foto doc. obrigatória"

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log("[validarFormularioCompleto] Resultado:", isValid, "Erros:", newErrors)
    return isValid
  }, [formData, selfieUri, documentoUri])

  // --- Submissão Final ---
  const handleFinalizarCadastro = useCallback(async () => {
    console.log("[handleSubmit] Botão pressionado.")
    Keyboard.dismiss()
    if (!validarFormularioCompleto()) {
      console.log("[handleSubmit] Falha validação.")
      Alert.alert("Erro", "Verifique os campos.")
      return
    }
    console.log("[handleSubmit] Validação OK.")
    setLoadingSubmit(true)
    setErrors({})
    let pessoaCriadaId: number | null = null
    const payloadRegistro: any = {
      pessoa_nome: formData.pessoa_nome,
      pessoa_email: formData.pessoa_email,
      pessoa_telefone: formData.pessoa_telefone?.replace(/\D/g, "") || null,
      pessoa_tipo: formData.pessoa_tipo,
      pessoa_login: formData.pessoa_login,
      pessoa_senha: formData.pessoa_senha,
      cep: formData.cep?.replace(/\D/g, ""),
      rua: formData.rua,
      bairro: formData.bairro,
      numero: formData.numero,
      complemento: formData.complemento || null,
      CIDADE_cidade_id: formData.CIDADE_cidade_id,
    }
    if (formData.pessoa_tipo === "Fisica") {
      payloadRegistro.pessoa_cpf = formData.pessoa_cpf?.replace(/\D/g, "")
    } else if (formData.pessoa_tipo === "Juridica") {
      payloadRegistro.cnpj = formData.cnpj?.replace(/\D/g, "")
      payloadRegistro.fornecedor_num = formData.fornecedor_num ? Number(formData.fornecedor_num) : null
    }
    console.log("[handleSubmit] Payload Registro:", payloadRegistro)
    try {
      const pessoaCriada = await pessoaService.registrar(payloadRegistro)
      pessoaCriadaId = pessoaCriada?.pessoa_id
      if (!pessoaCriadaId) throw new Error("ID não retornado.")
      console.log(`[handleSubmit] Pessoa registrada ID: ${pessoaCriadaId}`)
      if (formData.pessoa_tipo === "Fisica") {
        let uploadsOk = true
        if (selfieUri) {
          try {
            await pessoaService.uploadFoto(pessoaCriadaId, "selfie", selfieUri)
          } catch (e) {
            uploadsOk = false
            console.error("Erro selfie", e)
            Alert.alert("Erro", "Falha upload selfie.")
          }
        }
        if (documentoUri) {
          try {
            await pessoaService.uploadFoto(pessoaCriadaId, "documento", documentoUri)
          } catch (e) {
            uploadsOk = false
            console.error("Erro doc", e)
            Alert.alert("Erro", "Falha upload documento.")
          }
        }
        if (!uploadsOk) console.warn("Cadastro realizado, mas uploads falharam.")
      }
      Alert.alert("Sucesso!", "Cadastro realizado.")
      navigation.navigate("Login")
    } catch (err: any) {
      console.error("Erro finalizar cadastro:", err)
      Alert.alert("Erro", "Não foi possível cadastrar.")
    } finally {
      setLoadingSubmit(false)
    }
  }, [formData, selfieUri, documentoUri, validarFormularioCompleto, navigation])

  // Função para navegar entre seções
  const navigateToSection = (section: "pessoal" | "documento" | "endereco" | "validacao") => {
    setActiveSection(section)
  }

  // Renderização de seções
  const renderSectionButtons = () => (
    <View style={registerStyles.sectionButtons}>
      <TouchableOpacity
        style={[registerStyles.sectionButton, activeSection === "pessoal" && registerStyles.activeSectionButton]}
        onPress={() => navigateToSection("pessoal")}
      >
        <Ionicons
          name="person-outline"
          size={20}
          color={activeSection === "pessoal" ? "#fff" : "#666"}
          style={registerStyles.sectionIcon}
        />
        <Text
          style={[registerStyles.sectionButtonText, activeSection === "pessoal" && registerStyles.activeSectionButtonText]}
          numberOfLines={1}
        >
          Pessoal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[registerStyles.sectionButton, activeSection === "documento" && registerStyles.activeSectionButton]}
        onPress={() => navigateToSection("documento")}
      >
        <Ionicons
          name="document-text-outline"
          size={20}
          color={activeSection === "documento" ? "#fff" : "#666"}
          style={registerStyles.sectionIcon}
        />
        <Text
          style={[registerStyles.sectionButtonText, activeSection === "documento" && registerStyles.activeSectionButtonText]}
          numberOfLines={1}
        >
          Documento
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[registerStyles.sectionButton, activeSection === "endereco" && registerStyles.activeSectionButton]}
        onPress={() => navigateToSection("endereco")}
      >
        <Ionicons
          name="location-outline"
          size={20}
          color={activeSection === "endereco" ? "#fff" : "#666"}
          style={registerStyles.sectionIcon}
        />
        <Text
          style={[registerStyles.sectionButtonText, activeSection === "endereco" && registerStyles.activeSectionButtonText]}
          numberOfLines={1}
        >
          Endereço
        </Text>
      </TouchableOpacity>

      {formData.pessoa_tipo === "Fisica" && (
        <TouchableOpacity
          style={[registerStyles.sectionButton, activeSection === "validacao" && registerStyles.activeSectionButton]}
          onPress={() => navigateToSection("validacao")}
        >
          <Ionicons
            name="camera-outline"
            size={20}
            color={activeSection === "validacao" ? "#fff" : "#666"}
            style={registerStyles.sectionIcon}
          />
          <Text
            style={[registerStyles.sectionButtonText, activeSection === "validacao" && registerStyles.activeSectionButtonText]}
            numberOfLines={1}
          >
            Validação
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )

  // Renderização do conteúdo da seção
  const renderSectionContent = () => {
    switch (activeSection) {
      case "pessoal":
        return (
          <>
            <Text style={registerStyles.sectionTitle}>Dados Pessoais</Text>
            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Nome:</Text>
              <View style={[registerStyles.inputWrapper, errors.pessoa_nome && registerStyles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#666" style={registerStyles.inputIcon} />
                <TextInput
                  style={registerStyles.input}
                  value={formData.pessoa_nome}
                  onChangeText={(v) => handleInputChange("pessoa_nome", v)}
                  placeholder="Nome completo"
                  autoCapitalize="words"
                />
              </View>
              {errors.pessoa_nome && <Text style={registerStyles.errorText}>{errors.pessoa_nome}</Text>}
            </View>

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Email:</Text>
              <View style={[registerStyles.inputWrapper, errors.pessoa_email && registerStyles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#666" style={registerStyles.inputIcon} />
                <TextInput
                  style={registerStyles.input}
                  value={formData.pessoa_email}
                  onChangeText={(v) => handleInputChange("pessoa_email", v)}
                  placeholder="seuemail@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.pessoa_email && <Text style={registerStyles.errorText}>{errors.pessoa_email}</Text>}
            </View>

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Telefone:</Text>
              <View style={[registerStyles.inputWrapper, errors.pessoa_telefone && registerStyles.inputError]}>
                <Ionicons name="call-outline" size={20} color="#666" style={registerStyles.inputIcon} />
                <TextInput
                  style={registerStyles.input}
                  value={formData.pessoa_telefone}
                  onChangeText={(v) => handleInputChange("pessoa_telefone", v)}
                  placeholder="(XX) XXXXX-XXXX"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
              {errors.pessoa_telefone && <Text style={registerStyles.errorText}>{errors.pessoa_telefone}</Text>}
            </View>

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Senha:</Text>
              <View style={[registerStyles.inputWrapper, errors.pessoa_senha && registerStyles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={registerStyles.inputIcon} />
                <TextInput
                  style={registerStyles.input}
                  value={formData.pessoa_senha}
                  onChangeText={(v) => handleInputChange("pessoa_senha", v)}
                  placeholder="Mínimo 3 caracteres"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={registerStyles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {errors.pessoa_senha && <Text style={registerStyles.errorText}>{errors.pessoa_senha}</Text>}
            </View>

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Confirmar Senha:</Text>
              <View style={[registerStyles.inputWrapper, errors.confirmar_senha && registerStyles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={registerStyles.inputIcon} />
                <TextInput
                  style={registerStyles.input}
                  value={formData.confirmar_senha}
                  onChangeText={(v) => handleInputChange("confirmar_senha", v)}
                  placeholder="Repita a senha"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={registerStyles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {errors.confirmar_senha && <Text style={registerStyles.errorText}>{errors.confirmar_senha}</Text>}
            </View>

            <View style={registerStyles.navigationButtons}>
              <TouchableOpacity
                style={[registerStyles.navigationButton, registerStyles.nextButton]}
                onPress={() => navigateToSection("documento")}
              >
                <Text style={registerStyles.navigationButtonText}>Próximo</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )

      case "documento":
        return (
          <>
            <Text style={registerStyles.sectionTitle}>Tipo e Documento</Text>
            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Tipo de Conta:</Text>
              <View style={[registerStyles.pickerContainer, errors.pessoa_tipo ? registerStyles.inputError : null]}>
                <Picker
                  selectedValue={formData.pessoa_tipo}
                  onValueChange={(itemValue: PessoaTipo) => {
                    handleInputChange("pessoa_tipo", itemValue || "")
                  }}
                  style={registerStyles.picker}
                  prompt="Selecione o Tipo de Conta"
                >
                  <Picker.Item label="-- Selecione --" value="" style={registerStyles.pickerPlaceholder} />
                  <Picker.Item label="Pessoa Física (CPF)" value="Fisica" />
                  <Picker.Item label="Pessoa Jurídica (CNPJ)" value="Juridica" />
                </Picker>
              </View>
              {errors.pessoa_tipo && <Text style={registerStyles.errorText}>{errors.pessoa_tipo}</Text>}
            </View>

            {formData.pessoa_tipo === "Fisica" ? (
              <View style={registerStyles.inputGroup}>
                <Text style={registerStyles.label}>CPF:</Text>
                <View style={[registerStyles.inputWrapper, errors.pessoa_cpf && registerStyles.inputError]}>
                  <Ionicons name="card-outline" size={20} color="#666" style={registerStyles.inputIcon} />
                  <TextInput
                    style={registerStyles.input}
                    value={formData.pessoa_cpf}
                    onChangeText={(v) => handleInputChange("pessoa_cpf", v)}
                    placeholder="000.000.000-00"
                    keyboardType="numeric"
                    maxLength={14}
                  />
                </View>
                {errors.pessoa_cpf && <Text style={registerStyles.errorText}>{errors.pessoa_cpf}</Text>}
              </View>
            ) : null}

            {formData.pessoa_tipo === "Juridica" ? (
              <>
                <View style={registerStyles.inputGroup}>
                  <Text style={registerStyles.label}>CNPJ:</Text>
                  <View style={[registerStyles.inputWrapper, errors.cnpj && registerStyles.inputError]}>
                    <Ionicons name="business-outline" size={20} color="#666" style={registerStyles.inputIcon} />
                    <TextInput
                      style={registerStyles.input}
                      value={formData.cnpj}
                      onChangeText={(v) => handleInputChange("cnpj", v)}
                      placeholder="00.000.000/0000-00"
                      keyboardType="numeric"
                      maxLength={18}
                    />
                  </View>
                  {errors.cnpj && <Text style={registerStyles.errorText}>{errors.cnpj}</Text>}
                </View>

                <View style={registerStyles.inputGroup}>
                  <Text style={registerStyles.label}>Nº Fornecedor (Opc.):</Text>
                  <View style={[registerStyles.inputWrapper, errors.fornecedor_num && registerStyles.inputError]}>
                    <Ionicons name="pricetag-outline" size={20} color="#666" style={registerStyles.inputIcon} />
                    <TextInput
                      style={registerStyles.input}
                      value={formData.fornecedor_num}
                      onChangeText={(v) => handleInputChange("fornecedor_num", v.replace(/\D/g, ""))}
                      keyboardType="numeric"
                      placeholder="Número de fornecedor (opcional)"
                    />
                  </View>
                  {errors.fornecedor_num && <Text style={registerStyles.errorText}>{errors.fornecedor_num}</Text>}
                </View>
              </>
            ) : null}

            <View style={registerStyles.navigationButtons}>
              <TouchableOpacity
                style={[registerStyles.navigationButton, registerStyles.backButton]}
                onPress={() => navigateToSection("pessoal")}
              >
                <Ionicons name="arrow-back" size={20} color="#666" />
                <Text style={registerStyles.backButtonText}>Anterior</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[registerStyles.navigationButton, registerStyles.nextButton]}
                onPress={() => navigateToSection("endereco")}
              >
                <Text style={registerStyles.navigationButtonText}>Próximo</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )

      case "endereco":
        return (
          <>
            <Text style={registerStyles.sectionTitle}>Endereço</Text>
            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>CEP:</Text>
              <View style={[registerStyles.inputWrapper, errors.cep && registerStyles.inputError]}>
                <Ionicons name="location-outline" size={20} color="#666" style={registerStyles.inputIcon} />
                <TextInput
                  style={registerStyles.input}
                  value={formData.cep}
                  onChangeText={(v) => handleInputChange("cep", v)}
                  maxLength={9}
                  keyboardType="numeric"
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  placeholderTextColor="grey"
                />
                {loadingCep && <ActivityIndicator size="small" color="#0066cc" style={registerStyles.inputIcon} />}
              </View>
              {errors.cep && <Text style={registerStyles.errorText}>{errors.cep}</Text>}
            </View>

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Rua:</Text>
              <View style={[registerStyles.inputWrapper, registerStyles.inputDisabled, errors.rua && registerStyles.inputError]}>
                <Ionicons name="home-outline" size={20} color="#999" style={registerStyles.inputIcon} />
                <TextInput
                  style={[registerStyles.input, registerStyles.disabledText]}
                  value={formData.rua}
                  editable={false}
                  placeholder="Preenchido pelo CEP"
                  placeholderTextColor="grey"
                />
              </View>
              {errors.rua && <Text style={registerStyles.errorText}>{errors.rua}</Text>}
            </View>

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Bairro:</Text>
              <View style={[registerStyles.inputWrapper, registerStyles.inputDisabled]}>
                <Ionicons name="map-outline" size={20} color="#999" style={registerStyles.inputIcon} />
                <TextInput
                  style={[registerStyles.input, registerStyles.disabledText]}
                  value={formData.bairro}
                  editable={false}
                  placeholder="Preenchido pelo CEP"
                  placeholderTextColor="grey"
                />
              </View>
            </View>

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Número:</Text>
              <View style={[registerStyles.inputWrapper, errors.numero && registerStyles.inputError]}>
                <Ionicons name="pin-outline" size={20} color="#666" style={registerStyles.inputIcon} />
                <TextInput
                  style={registerStyles.input}
                  value={formData.numero}
                  onChangeText={(v) => handleInputChange("numero", v)}
                  placeholder="Número ou S/N"
                  placeholderTextColor="grey"
                />
              </View>
              {errors.numero && <Text style={registerStyles.errorText}>{errors.numero}</Text>}
            </View>

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Complemento:</Text>
              <View style={[registerStyles.inputWrapper, errors.complemento && registerStyles.inputError]}>
                <Ionicons name="information-circle-outline" size={20} color="#666" style={registerStyles.inputIcon} />
                <TextInput
                  style={registerStyles.input}
                  value={formData.complemento}
                  onChangeText={(v) => handleInputChange("complemento", v)}
                  placeholder="(Opcional)"
                  placeholderTextColor="grey"
                />
              </View>
              {errors.complemento && <Text style={registerStyles.errorText}>{errors.complemento}</Text>}
            </View>

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Cidade:</Text>
              <View style={[registerStyles.inputWrapper, registerStyles.inputDisabled]}>
                <Ionicons name="business-outline" size={20} color="#999" style={registerStyles.inputIcon} />
                <TextInput
                  style={[registerStyles.input, registerStyles.disabledText]}
                  value={formData.cidade}
                  editable={false}
                  placeholder="Preenchido pelo CEP"
                  placeholderTextColor="grey"
                />
              </View>
            </View>

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Estado (UF):</Text>
              <View style={[registerStyles.inputWrapper, registerStyles.inputDisabled]}>
                <Ionicons name="flag-outline" size={20} color="#999" style={registerStyles.inputIcon} />
                <TextInput
                  style={[registerStyles.input, registerStyles.disabledText]}
                  value={formData.estado}
                  editable={false}
                  placeholder="Preenchido pelo CEP"
                  placeholderTextColor="grey"
                />
              </View>
            </View>

            <View style={registerStyles.navigationButtons}>
              <TouchableOpacity
                style={[registerStyles.navigationButton, registerStyles.backButton]}
                onPress={() => navigateToSection("documento")}
              >
                <Ionicons name="arrow-back" size={20} color="#666" />
                <Text style={registerStyles.backButtonText}>Anterior</Text>
              </TouchableOpacity>

              {formData.pessoa_tipo === "Fisica" ? (
                <TouchableOpacity
                  style={[registerStyles.navigationButton, registerStyles.nextButton]}
                  onPress={() => navigateToSection("validacao")}
                >
                  <Text style={registerStyles.navigationButtonText}>Próximo</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[registerStyles.navigationButton, registerStyles.finalizarButton, loadingSubmit && registerStyles.buttonDisabled]}
                  onPress={handleFinalizarCadastro}
                  disabled={loadingSubmit}
                >
                  {loadingSubmit ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={registerStyles.navigationButtonText}>Finalizar</Text>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </>
        )

      case "validacao":
        return (
          <>
            <Text style={registerStyles.sectionTitle}>Validação de Identidade</Text>
            <Text style={registerStyles.sectionDescription}>
              Para validar sua identidade, precisamos de uma selfie e uma foto do seu documento.
            </Text>

            <View style={registerStyles.photoSection}>
              <View style={registerStyles.photoPreviewContainer}>
                {selfieUri ? (
                  <Image source={{ uri: selfieUri }} style={registerStyles.imagePreview} />
                ) : (
                  <View style={registerStyles.imagePlaceholder}>
                    <Ionicons name="person-outline" size={40} color="grey" />
                  </View>
                )}
                <TouchableOpacity
                  style={[registerStyles.imagePickerButton, loadingSubmit && registerStyles.buttonDisabled]}
                  onPress={() => handlePickImage("selfie")}
                  disabled={loadingSubmit}
                >
                  <Ionicons name="camera-outline" size={20} color="white" />
                  <Text style={registerStyles.imagePickerButtonText}>Enviar Selfie</Text>
                </TouchableOpacity>
                {errors.selfie && <Text style={registerStyles.errorText}>{errors.selfie}</Text>}
              </View>

              <View style={registerStyles.photoPreviewContainer}>
                {documentoUri ? (
                  <Image source={{ uri: documentoUri }} style={registerStyles.imagePreview} />
                ) : (
                  <View style={registerStyles.imagePlaceholder}>
                    <Ionicons name="document-text-outline" size={40} color="grey" />
                  </View>
                )}
                <TouchableOpacity
                  style={[registerStyles.imagePickerButton, loadingSubmit && registerStyles.buttonDisabled]}
                  onPress={() => handlePickImage("documento")}
                  disabled={loadingSubmit}
                >
                  <Ionicons name="camera-outline" size={20} color="white" />
                  <Text style={registerStyles.imagePickerButtonText}>Foto Documento</Text>
                </TouchableOpacity>
                {errors.documento && <Text style={registerStyles.errorText}>{errors.documento}</Text>}
              </View>
            </View>

            <View style={registerStyles.navigationButtons}>
              <TouchableOpacity
                style={[registerStyles.navigationButton, registerStyles.backButton]}
                onPress={() => navigateToSection("endereco")}
              >
                <Ionicons name="arrow-back" size={20} color="#666" />
                <Text style={registerStyles.backButtonText}>Anterior</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[registerStyles.navigationButton, registerStyles.finalizarButton, loadingSubmit && registerStyles.buttonDisabled]}
                onPress={handleFinalizarCadastro}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={registerStyles.navigationButtonText}>Finalizar</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )

      default:
        return null
    }
  }

  // --- Renderização Principal ---
  if (errors.form) {
    return <Text style={[registerStyles.centered, registerStyles.errorText]}>{errors.form}</Text>
  }

  return (
    <ScrollView contentContainerStyle={registerStyles.scrollContainer} keyboardShouldPersistTaps="handled">
      <Animated.View style={[registerStyles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={registerStyles.header}>
          <Text style={registerStyles.title}>Criar Conta</Text>
        </View>

        {renderSectionButtons()}

        <View style={registerStyles.formContainer}>{renderSectionContent()}</View>
      </Animated.View>
    </ScrollView>
  )
}

export default CadastroScreen
