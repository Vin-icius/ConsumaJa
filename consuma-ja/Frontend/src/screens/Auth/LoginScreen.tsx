import React, { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import type { StackNavigationProp } from "@react-navigation/stack"
import authService from "../../services/authService"
import { styles } from "../../common/styles/Auth/loginScreen.styled"

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
    [key: string]: any
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
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, "")

    // Limita a 11 dígitos (CPF)
    const cpf = cleaned.slice(0, 11)

    // Aplica a máscara de CPF
    if (cpf.length <= 3) return cpf
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
  }

  const formatCNPJ = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, "")

    // Limita a 14 dígitos (CNPJ)
    const cnpj = cleaned.slice(0, 14)

    // Aplica a máscara de CNPJ
    if (cnpj.length <= 2) return cnpj
    if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`
    if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`
    if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`
  }

  // Função para determinar se é um CPF ou CNPJ e aplicar a formatação correta
  const formatDocument = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, "")

    // Se for um número de ID curto (até 3 dígitos), retorna sem formatação
    if (cleaned.length <= 3) return cleaned

    // Se tiver até 11 dígitos, formata como CPF
    if (cleaned.length <= 11) return formatCPF(cleaned)

    // Se tiver mais de 11 dígitos, formata como CNPJ
    return formatCNPJ(cleaned)
  }

  // Atualiza state e aplica formatação
  const handleIdentifierChange = (text: string) => {
    // Remove todos os caracteres não numéricos do texto inserido
    const onlyNumbers = text.replace(/\D/g, "")

    // Se o usuário tentar inserir algo não numérico, ignoramos
    if (text !== onlyNumbers && !text.includes(".") && !text.includes("-") && !text.includes("/")) {
      return
    }

    // Aplicamos a formatação adequada baseada no número de dígitos
    setIdentifier(formatDocument(onlyNumbers))
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
      const response = (await authService.login({
        login: loginToSend,
        senha: senha,
      })) as LoginResponse

      const { token, user } = response
      if (token && user?.tipo) {
        await AsyncStorage.setItem("userToken", token)
        await AsyncStorage.setItem("userType", user.tipo)

        navigation.replace("Dashboard")
      } else {
        setErrorMessage("Erro inesperado na resposta do servidor.")
      }
    } catch (error: any) {
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
          {/* <Image source={require('/home/Frontend/src/assets/logo.png')} style={styles.logoImage} /> */}
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
                placeholder="Digite seu CPF/CNPJ"
                value={identifier}
                onChangeText={handleIdentifierChange}
                maxLength={18} // Tamanho máximo para CNPJ formatado
                keyboardType="numeric"
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

export default LoginScreen
