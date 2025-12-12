import React, { useState, useRef, useEffect } from "react"
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
import { Ionicons } from "@expo/vector-icons"
import type { StackNavigationProp } from "@react-navigation/stack"
import authService from "../../services/authService"
import { styles } from "../../common/styles/Auth/loginScreen.styled"
import { useCart } from "../../contexts/CartContext/cartContext"
import { useApplication } from "../../contexts/ApplicationContext/ApplicationContext"
import AsyncStorage from "@react-native-async-storage/async-storage"

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
  token?: string
  user: {
    tipo: string
    two_fa?: boolean
    twoFactorEnabled?: boolean
    [key: string]: any
  }
  session?: {
    id?: string
    expiraEm?: string
    dadosUsuario?: Record<string, unknown> | null
  }
  twoFactorRequired?: boolean
  twoFactorToken?: string
  message?: string
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
  const [twoFactorVisible, setTwoFactorVisible] = useState(false)
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [twoFactorError, setTwoFactorError] = useState("")
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [pendingTwoFactorUser, setPendingTwoFactorUser] = useState<LoginResponse["user"] | null>(null)
  const { refreshCart } = useCart()
  const { setAuthenticatedUser, validateActiveSession, sessionId } = useApplication()
  const [checkingSession, setCheckingSession] = useState(true)

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

  useEffect(() => {
    let isMounted = true

    const ensureActiveSession = async () => {
      if (!sessionId) {
        setCheckingSession(false)
        return
      }

      try {
        const sessionUser = await validateActiveSession()
        if (sessionUser && isMounted) {
          navigation.replace("Dashboard")
        }
      } catch (error) {
        console.warn("Sessão anterior inválida:", error)
      } finally {
        if (isMounted) {
          setCheckingSession(false)
        }
      }
    }

    ensureActiveSession()

    return () => {
      isMounted = false
    }
  }, [sessionId, validateActiveSession, navigation])

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
    setTwoFactorVisible(false)
    setTwoFactorToken(null)
    setTwoFactorCode("")
    setTwoFactorError("")
    setPendingTwoFactorUser(null)

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

      const { token, user, session, twoFactorRequired, twoFactorToken, message } = response
      const requiresTwoFactor = Boolean(twoFactorRequired || user?.two_fa || user?.twoFactorEnabled)

      if (requiresTwoFactor) {
        if (!twoFactorToken) {
          setErrorMessage(message || "É necessário confirmar o código do autenticador.")
        } else {
          setTwoFactorToken(twoFactorToken)
          setPendingTwoFactorUser(user)
          setTwoFactorVisible(true)
          setErrorMessage("")
        }
        return
      }

      const resolvedUserId = user?.id ?? user?.pessoa_id
      if (token && resolvedUserId) {
        setAuthenticatedUser({ user, token, session })

        // Define role do usuário para controle de menus (Admin / Fornecedor / Cliente)
        const rawTipo = (user?.tipo ?? user?.pessoa_tipo ?? "").toString().toLowerCase()
        let roleToStore: "Admin" | "Fornecedor" | "Cliente" = "Cliente"

        // Prioriza sinalização explícita de Admin, mesmo que o pessoa_tipo seja Juridica
        if (rawTipo === "admin" || rawTipo === "administrador" || user?.is_admin) {
          roleToStore = "Admin"
        } else if (rawTipo === "juridica" || rawTipo === "fornecedor") {
          roleToStore = "Fornecedor"
        }
        try {
          await AsyncStorage.setItem("userRole", roleToStore)
        } catch (e) {
          console.warn("Falha ao salvar userRole no AsyncStorage", e)
        }
        try {
          await refreshCart()
        } catch (refreshError) {
          console.error("Falha ao sincronizar carrinho após login:", refreshError)
        }
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

  const handleVerifyTwoFactor = async () => {
    if (!twoFactorToken) {
      setTwoFactorError("Token de verificação não encontrado. Faça login novamente.")
      return
    }

    const sanitizedCode = twoFactorCode.replace(/\D/g, "")

    if (sanitizedCode.length !== 6) {
      setTwoFactorError("Informe o código com 6 dígitos.")
      return
    }

    setTwoFactorLoading(true)
    setTwoFactorError("")

    try {
      const verification = await authService.verifyTwoFactor(twoFactorToken, sanitizedCode)

      if (!verification?.token || !verification?.user) {
        throw new Error("Resposta inválida do servidor.")
      }

      setAuthenticatedUser({ user: verification.user, token: verification.token, session: verification.session })

      try {
        await refreshCart()
      } catch (refreshError) {
        console.error("Falha ao sincronizar carrinho após 2FA:", refreshError)
      }

      setTwoFactorVisible(false)
      setTwoFactorToken(null)
      setTwoFactorCode("")
      setPendingTwoFactorUser(null)
      // Deriva e persiste a role após 2FA para manter a navegação correta
      const verifiedRawTipo = (verification.user?.tipo ?? verification.user?.pessoa_tipo ?? "").toString().toLowerCase()
      let verifiedRole: "Admin" | "Fornecedor" | "Cliente" = "Cliente"

      if (verifiedRawTipo === "admin" || verifiedRawTipo === "administrador" || verification.user?.is_admin) {
        verifiedRole = "Admin"
      } else if (verifiedRawTipo === "juridica" || verifiedRawTipo === "fornecedor") {
        verifiedRole = "Fornecedor"
      }

      try {
        await AsyncStorage.setItem("userRole", verifiedRole)
      } catch (e) {
        console.warn("Falha ao salvar userRole após 2FA", e)
      }

      navigation.replace("Dashboard")
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Código inválido ou expirado. Tente novamente."
      setTwoFactorError(message)
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleCancelTwoFactor = () => {
    setTwoFactorVisible(false)
    setTwoFactorToken(null)
    setTwoFactorCode("")
    setTwoFactorError("")
    setPendingTwoFactorUser(null)
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
            style={[styles.loginButton, (loading || checkingSession) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || checkingSession}
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

      {twoFactorVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirme o código 2FA</Text>
            <Text style={styles.modalDescription}>
              {pendingTwoFactorUser?.pessoa_email || pendingTwoFactorUser?.email
                ? `Informe o código gerado no aplicativo autenticador para ${pendingTwoFactorUser.pessoa_email ?? pendingTwoFactorUser.email}.`
                : "Informe o código gerado no aplicativo autenticador para concluir o acesso."}
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons name="keypad-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.twoFactorInput}
                placeholder="000000"
                keyboardType="numeric"
                value={twoFactorCode}
                onChangeText={(value) => {
                  const sanitized = value.replace(/\D/g, "").slice(0, 6)
                  setTwoFactorCode(sanitized)
                  if (twoFactorError) {
                    setTwoFactorError("")
                  }
                }}
                maxLength={6}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleVerifyTwoFactor}
              />
            </View>

            {twoFactorError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={18} color="#e74c3c" />
                <Text style={styles.errorText}>{twoFactorError}</Text>
              </View>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelTwoFactor}
                disabled={twoFactorLoading}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  (twoFactorLoading || twoFactorCode.length !== 6) && styles.buttonDisabled,
                ]}
                onPress={handleVerifyTwoFactor}
                disabled={twoFactorLoading || twoFactorCode.length !== 6}
              >
                {twoFactorLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Verificar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default LoginScreen
