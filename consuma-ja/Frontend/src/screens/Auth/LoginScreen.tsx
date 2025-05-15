"use client"

import React, { useState, useRef } from "react"
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { StackNavigationProp } from "@react-navigation/stack"
import authService from "../../services/authService"

// Definindo tipos para navegação
type RootStackParamList = {
  Login: undefined
  Cadastro: undefined
  Dashboard: undefined
}

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp
}

// Definindo tipo para resposta de login
interface LoginResponse {
  token: string
  user: {
    tipo: string
    [key: string]: any // Para outras propriedades do usuário
  }
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // Estados
  const [senha, setSenha] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [identifier, setIdentifier] = useState("") // Campo unificado para Login/CPF/CNPJ/Email
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false)
  const [resetEmail, setResetEmail] = useState("")

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Referência para o input de senha
  const passwordInputRef = useRef<TextInput>(null)

  // Efeito de animação ao montar o componente
  React.useEffect(() => {
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

  // Funções de formatação CPF/CNPJ
  const formatCPF = (value: string): string => {
    value = value.slice(0, 11)
    if (value.length <= 3) return value
    if (value.length <= 6) return value.replace(/(\d{3})(\d{1,})/, "$1.$2")
    if (value.length <= 9) return value.replace(/(\d{3})(\d{3})(\d{1,})/, "$1.$2.$3")
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,})/, "$1.$2.$3-$4")
  }

  const formatCNPJ = (value: string): string => {
    value = value.slice(0, 14)
    if (value.length <= 2) return value
    if (value.length <= 5) return value.replace(/(\d{2})(\d{1,})/, "$1.$2")
    if (value.length <= 8) return value.replace(/(\d{2})(\d{3})(\d{1,})/, "$1.$2.$3")
    if (value.length <= 12) return value.replace(/(\d{2})(\d{3})(\d{3})(\d{1,})/, "$1.$2.$3/$4")
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,})/, "$1.$2.$3/$4-$5")
  }

  const formatInput = (text: string) => {
    // Remove caracteres não numéricos para verificação
    const cleaned = text.replace(/\D/g, "")

    // Verifica se é um número e aplica a formatação apropriada
    if (/^\d+$/.test(text)) {
      if (cleaned.length <= 3) {
        return cleaned // Admin ID
      } else if (cleaned.length <= 11) {
        return formatCPF(cleaned) // CPF
      } else if (cleaned.length <= 14) {
        return formatCNPJ(cleaned) // CNPJ
      }
    }

    // Se não for numérico ou for email, retorna o texto como está
    return text
  }

  // Atualiza state e aplica formatação
  const handleIdentifierChange = (text: string) => {
    if (text.includes("@") || !/^\d{1,14}$/.test(text.replace(/\D/g, ""))) {
      setIdentifier(text)
    } else {
      setIdentifier(formatInput(text))
    }
  }

  // Função para focar no próximo input
  const focusNextInput = () => {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus()
    }
  }

  // Handler de login
  const handleLogin = async () => {
    Keyboard.dismiss()
    setErrorMessage("")

    const loginToSend = identifier.trim()

    if (!loginToSend) {
      setErrorMessage("Preencha o campo Login/Email/CPF/CNPJ.")
      return
    }
    if (!senha) {
      setErrorMessage("Preencha a senha.")
      return
    }

    setLoading(true)

    try {
      console.log(`[LoginScreen] Tentando login com: ${loginToSend}`)
      const response = await authService.login({
        login: loginToSend,
        senha: senha,
      }) as LoginResponse

      console.log("[LoginScreen] Login bem-sucedido:", response)

      const { token, user } = response
      if (token && user?.tipo) {
        await AsyncStorage.setItem("userToken", token)
        await AsyncStorage.setItem("userType", user.tipo)
        console.log("[LoginScreen] Token e userType salvos.")

        navigation.replace("Dashboard")
      } else {
        console.error("[LoginScreen] Resposta da API de login inválida:", response)
        setErrorMessage("Erro inesperado na resposta do servidor.")
      }
    } catch (error: any) {
      console.error("[LoginScreen] Erro no handleLogin:", error)
      const message =
        error.response?.data?.message ||
        error.message ||
        "Erro ao tentar fazer login. Verifique suas credenciais ou conexão."
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  // Handler para "Esqueci minha senha"
  const handleForgotPassword = () => {
    setForgotPasswordVisible(true)
  }

  // Handler para enviar solicitação de redefinição de senha
  const handleResetPassword = () => {
    if (!resetEmail || !resetEmail.includes("@")) {
      Alert.alert("Erro", "Por favor, insira um email válido.")
      return
    }

    // Aqui você implementaria a chamada à API quando estiver pronta
    Alert.alert(
      "Solicitação Enviada",
      "Se este email estiver cadastrado em nosso sistema, você receberá instruções para redefinir sua senha.",
      [{ text: "OK", onPress: () => setForgotPasswordVisible(false) }],
    )

    setResetEmail("")
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          {/* Substitua pelo seu logo */}
          <View style={styles.logoPlaceholder}>
            <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
          </View>
          <Text style={styles.title}>Bem-vindo</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Campo de identificação */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}> CPF / CNPJ</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite seu identificador"
                value={identifier}
                onChangeText={handleIdentifierChange}
                maxLength={50}
                autoCapitalize="none"
                autoComplete="username"
                returnKeyType="next"
                onSubmitEditing={focusNextInput}
              />
            </View>
          </View>

          {/* Campo de senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="Digite sua senha"
                secureTextEntry={!showPassword}
                value={senha}
                onChangeText={setSenha}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mensagem de erro */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={18} color="#e74c3c" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Esqueci minha senha */}
          <TouchableOpacity style={styles.forgotPasswordLink} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* Botão de login */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.loginButtonText}>Entrar</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Link para cadastro */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>É novo por aqui?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Cadastro")}>
              <Text style={styles.registerLink}>Cadastre-se agora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Modal de Esqueci Minha Senha */}
      {forgotPasswordVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Recuperar Senha</Text>
            <Text style={styles.modalDescription}>
              Digite seu email cadastrado para receber instruções de recuperação de senha.
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Seu email"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setForgotPasswordVisible(false)}>
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirmButton} onPress={handleResetPassword}>
                <Text style={styles.modalConfirmButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  logoImage: {
  width: 80,
  height: 80,
  resizeMode: 'contain',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 40,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e6f0ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
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
  passwordToggle: {
    padding: 10,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fdeaea",
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "#e74c3c",
    marginLeft: 5,
    fontSize: 14,
    flex: 1,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#0066cc",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonDisabled: {
    backgroundColor: "#a7c7e7",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#666",
  },
  registerLink: {
    fontSize: 14,
    color: "#0066cc",
    fontWeight: "bold",
    marginLeft: 5,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: width * 0.85,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#0066cc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    color: "white",
    fontWeight: "500",
  },
})

export default LoginScreen