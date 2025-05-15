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
      const address = response.data
      setFormData((prev) => ({
        ...prev,
        rua: address.logradouro || "",
        bairro: address.bairro || "",
        cidade: address.cidade || "",
        estado: address.estado || "",
        CIDADE_cidade_id: address.cidadeId || null,
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
    <View style={styles.sectionButtons}>
      <TouchableOpacity
        style={[styles.sectionButton, activeSection === "pessoal" && styles.activeSectionButton]}
        onPress={() => navigateToSection("pessoal")}
      >
        <Ionicons
          name="person-outline"
          size={20}
          color={activeSection === "pessoal" ? "#fff" : "#666"}
          style={styles.sectionIcon}
        />
        <Text
          style={[styles.sectionButtonText, activeSection === "pessoal" && styles.activeSectionButtonText]}
          numberOfLines={1}
        >
          Pessoal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.sectionButton, activeSection === "documento" && styles.activeSectionButton]}
        onPress={() => navigateToSection("documento")}
      >
        <Ionicons
          name="document-text-outline"
          size={20}
          color={activeSection === "documento" ? "#fff" : "#666"}
          style={styles.sectionIcon}
        />
        <Text
          style={[styles.sectionButtonText, activeSection === "documento" && styles.activeSectionButtonText]}
          numberOfLines={1}
        >
          Documento
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.sectionButton, activeSection === "endereco" && styles.activeSectionButton]}
        onPress={() => navigateToSection("endereco")}
      >
        <Ionicons
          name="location-outline"
          size={20}
          color={activeSection === "endereco" ? "#fff" : "#666"}
          style={styles.sectionIcon}
        />
        <Text
          style={[styles.sectionButtonText, activeSection === "endereco" && styles.activeSectionButtonText]}
          numberOfLines={1}
        >
          Endereço
        </Text>
      </TouchableOpacity>

      {formData.pessoa_tipo === "Fisica" && (
        <TouchableOpacity
          style={[styles.sectionButton, activeSection === "validacao" && styles.activeSectionButton]}
          onPress={() => navigateToSection("validacao")}
        >
          <Ionicons
            name="camera-outline"
            size={20}
            color={activeSection === "validacao" ? "#fff" : "#666"}
            style={styles.sectionIcon}
          />
          <Text
            style={[styles.sectionButtonText, activeSection === "validacao" && styles.activeSectionButtonText]}
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
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome:</Text>
              <View style={[styles.inputWrapper, errors.pessoa_nome && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.pessoa_nome}
                  onChangeText={(v) => handleInputChange("pessoa_nome", v)}
                  placeholder="Nome completo"
                  autoCapitalize="words"
                />
              </View>
              {errors.pessoa_nome && <Text style={styles.errorText}>{errors.pessoa_nome}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email:</Text>
              <View style={[styles.inputWrapper, errors.pessoa_email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.pessoa_email}
                  onChangeText={(v) => handleInputChange("pessoa_email", v)}
                  placeholder="seuemail@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.pessoa_email && <Text style={styles.errorText}>{errors.pessoa_email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone:</Text>
              <View style={[styles.inputWrapper, errors.pessoa_telefone && styles.inputError]}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.pessoa_telefone}
                  onChangeText={(v) => handleInputChange("pessoa_telefone", v)}
                  placeholder="(XX) XXXXX-XXXX"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
              {errors.pessoa_telefone && <Text style={styles.errorText}>{errors.pessoa_telefone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha:</Text>
              <View style={[styles.inputWrapper, errors.pessoa_senha && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.pessoa_senha}
                  onChangeText={(v) => handleInputChange("pessoa_senha", v)}
                  placeholder="Mínimo 3 caracteres"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {errors.pessoa_senha && <Text style={styles.errorText}>{errors.pessoa_senha}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Senha:</Text>
              <View style={[styles.inputWrapper, errors.confirmar_senha && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.confirmar_senha}
                  onChangeText={(v) => handleInputChange("confirmar_senha", v)}
                  placeholder="Repita a senha"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {errors.confirmar_senha && <Text style={styles.errorText}>{errors.confirmar_senha}</Text>}
            </View>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navigationButton, styles.nextButton]}
                onPress={() => navigateToSection("documento")}
              >
                <Text style={styles.navigationButtonText}>Próximo</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )

      case "documento":
        return (
          <>
            <Text style={styles.sectionTitle}>Tipo e Documento</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Conta:</Text>
              <View style={[styles.pickerContainer, errors.pessoa_tipo ? styles.inputError : null]}>
                <Picker
                  selectedValue={formData.pessoa_tipo}
                  onValueChange={(itemValue: PessoaTipo) => {
                    handleInputChange("pessoa_tipo", itemValue || "")
                  }}
                  style={styles.picker}
                  prompt="Selecione o Tipo de Conta"
                >
                  <Picker.Item label="-- Selecione --" value="" style={styles.pickerPlaceholder} />
                  <Picker.Item label="Pessoa Física (CPF)" value="Fisica" />
                  <Picker.Item label="Pessoa Jurídica (CNPJ)" value="Juridica" />
                </Picker>
              </View>
              {errors.pessoa_tipo && <Text style={styles.errorText}>{errors.pessoa_tipo}</Text>}
            </View>

            {formData.pessoa_tipo === "Fisica" ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CPF:</Text>
                <View style={[styles.inputWrapper, errors.pessoa_cpf && styles.inputError]}>
                  <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.pessoa_cpf}
                    onChangeText={(v) => handleInputChange("pessoa_cpf", v)}
                    placeholder="000.000.000-00"
                    keyboardType="numeric"
                    maxLength={14}
                  />
                </View>
                {errors.pessoa_cpf && <Text style={styles.errorText}>{errors.pessoa_cpf}</Text>}
              </View>
            ) : null}

            {formData.pessoa_tipo === "Juridica" ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CNPJ:</Text>
                  <View style={[styles.inputWrapper, errors.cnpj && styles.inputError]}>
                    <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.cnpj}
                      onChangeText={(v) => handleInputChange("cnpj", v)}
                      placeholder="00.000.000/0000-00"
                      keyboardType="numeric"
                      maxLength={18}
                    />
                  </View>
                  {errors.cnpj && <Text style={styles.errorText}>{errors.cnpj}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nº Fornecedor (Opc.):</Text>
                  <View style={[styles.inputWrapper, errors.fornecedor_num && styles.inputError]}>
                    <Ionicons name="pricetag-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.fornecedor_num}
                      onChangeText={(v) => handleInputChange("fornecedor_num", v.replace(/\D/g, ""))}
                      keyboardType="numeric"
                      placeholder="Número de fornecedor (opcional)"
                    />
                  </View>
                  {errors.fornecedor_num && <Text style={styles.errorText}>{errors.fornecedor_num}</Text>}
                </View>
              </>
            ) : null}

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navigationButton, styles.backButton]}
                onPress={() => navigateToSection("pessoal")}
              >
                <Ionicons name="arrow-back" size={20} color="#666" />
                <Text style={styles.backButtonText}>Anterior</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navigationButton, styles.nextButton]}
                onPress={() => navigateToSection("endereco")}
              >
                <Text style={styles.navigationButtonText}>Próximo</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )

      case "endereco":
        return (
          <>
            <Text style={styles.sectionTitle}>Endereço</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CEP:</Text>
              <View style={[styles.inputWrapper, errors.cep && styles.inputError]}>
                <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.cep}
                  onChangeText={(v) => handleInputChange("cep", v)}
                  maxLength={9}
                  keyboardType="numeric"
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  placeholderTextColor="grey"
                />
                {loadingCep && <ActivityIndicator size="small" color="#0066cc" style={styles.inputIcon} />}
              </View>
              {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rua:</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled, errors.rua && styles.inputError]}>
                <Ionicons name="home-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledText]}
                  value={formData.rua}
                  editable={false}
                  placeholder="Preenchido pelo CEP"
                  placeholderTextColor="grey"
                />
              </View>
              {errors.rua && <Text style={styles.errorText}>{errors.rua}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bairro:</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Ionicons name="map-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledText]}
                  value={formData.bairro}
                  editable={false}
                  placeholder="Preenchido pelo CEP"
                  placeholderTextColor="grey"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número:</Text>
              <View style={[styles.inputWrapper, errors.numero && styles.inputError]}>
                <Ionicons name="pin-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.numero}
                  onChangeText={(v) => handleInputChange("numero", v)}
                  placeholder="Número ou S/N"
                  placeholderTextColor="grey"
                />
              </View>
              {errors.numero && <Text style={styles.errorText}>{errors.numero}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Complemento:</Text>
              <View style={[styles.inputWrapper, errors.complemento && styles.inputError]}>
                <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.complemento}
                  onChangeText={(v) => handleInputChange("complemento", v)}
                  placeholder="(Opcional)"
                  placeholderTextColor="grey"
                />
              </View>
              {errors.complemento && <Text style={styles.errorText}>{errors.complemento}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cidade:</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Ionicons name="business-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledText]}
                  value={formData.cidade}
                  editable={false}
                  placeholder="Preenchido pelo CEP"
                  placeholderTextColor="grey"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estado (UF):</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Ionicons name="flag-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledText]}
                  value={formData.estado}
                  editable={false}
                  placeholder="Preenchido pelo CEP"
                  placeholderTextColor="grey"
                />
              </View>
            </View>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navigationButton, styles.backButton]}
                onPress={() => navigateToSection("documento")}
              >
                <Ionicons name="arrow-back" size={20} color="#666" />
                <Text style={styles.backButtonText}>Anterior</Text>
              </TouchableOpacity>

              {formData.pessoa_tipo === "Fisica" ? (
                <TouchableOpacity
                  style={[styles.navigationButton, styles.nextButton]}
                  onPress={() => navigateToSection("validacao")}
                >
                  <Text style={styles.navigationButtonText}>Próximo</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.navigationButton, styles.finalizarButton, loadingSubmit && styles.buttonDisabled]}
                  onPress={handleFinalizarCadastro}
                  disabled={loadingSubmit}
                >
                  {loadingSubmit ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.navigationButtonText}>Finalizar</Text>
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
            <Text style={styles.sectionTitle}>Validação de Identidade</Text>
            <Text style={styles.sectionDescription}>
              Para validar sua identidade, precisamos de uma selfie e uma foto do seu documento.
            </Text>

            <View style={styles.photoSection}>
              <View style={styles.photoPreviewContainer}>
                {selfieUri ? (
                  <Image source={{ uri: selfieUri }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="person-outline" size={40} color="grey" />
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.imagePickerButton, loadingSubmit && styles.buttonDisabled]}
                  onPress={() => handlePickImage("selfie")}
                  disabled={loadingSubmit}
                >
                  <Ionicons name="camera-outline" size={20} color="white" />
                  <Text style={styles.imagePickerButtonText}>Enviar Selfie</Text>
                </TouchableOpacity>
                {errors.selfie && <Text style={styles.errorText}>{errors.selfie}</Text>}
              </View>

              <View style={styles.photoPreviewContainer}>
                {documentoUri ? (
                  <Image source={{ uri: documentoUri }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="document-text-outline" size={40} color="grey" />
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.imagePickerButton, loadingSubmit && styles.buttonDisabled]}
                  onPress={() => handlePickImage("documento")}
                  disabled={loadingSubmit}
                >
                  <Ionicons name="camera-outline" size={20} color="white" />
                  <Text style={styles.imagePickerButtonText}>Foto Documento</Text>
                </TouchableOpacity>
                {errors.documento && <Text style={styles.errorText}>{errors.documento}</Text>}
              </View>
            </View>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navigationButton, styles.backButton]}
                onPress={() => navigateToSection("endereco")}
              >
                <Ionicons name="arrow-back" size={20} color="#666" />
                <Text style={styles.backButtonText}>Anterior</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navigationButton, styles.finalizarButton, loadingSubmit && styles.buttonDisabled]}
                onPress={handleFinalizarCadastro}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.navigationButtonText}>Finalizar</Text>
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
    return <Text style={[styles.centered, styles.errorText]}>{errors.form}</Text>
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backToLoginButton} onPress={() => navigation.navigate("Login")}>
            <Ionicons name="arrow-back" size={24} color="#0066cc" />
            <Text style={styles.backToLoginText}>Voltar ao Login</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Criar Conta</Text>
        </View>

        {renderSectionButtons()}

        <View style={styles.formContainer}>{renderSectionContent()}</View>
      </Animated.View>
    </ScrollView>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backToLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backToLoginText: {
    color: "#0066cc",
    marginLeft: 5,
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  sectionButtons: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 5,
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  activeSectionButton: {
    backgroundColor: "#0066cc",
  },
  sectionIcon: {
    marginRight: 5,
  },
  sectionButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  activeSectionButtonText: {
    color: "#fff",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#555",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderColor: "red",
  },
  inputDisabled: {
    backgroundColor: "#e9ecef",
  },
  disabledText: {
    color: "#6c757d",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 3,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    marginTop: Platform.OS === "ios" ? -10 : 0,
  },
  pickerPlaceholder: {
    color: "#a1a1a1",
  },
  passwordToggle: {
    padding: 10,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  backButtonText: {
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: "#0066cc",
  },
  finalizarButton: {
    backgroundColor: "#28a745",
  },
  buttonDisabled: {
    backgroundColor: "#a7c7e7",
  },
  navigationButtonText: {
    color: "white",
    marginRight: 5,
    fontWeight: "500",
  },
  photoSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    marginVertical: 15,
    flexWrap: "wrap",
  },
  photoPreviewContainer: {
    alignItems: "center",
    width: width > 500 ? "45%" : "100%",
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  imagePickerButton: {
    flexDirection: "row",
    backgroundColor: "#5bc0de",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  imagePickerButtonText: {
    color: "white",
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
  },
})

export default CadastroScreen
