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
import { useAuth } from "../../contexts/AuthContext/authContext"
import { styles } from "../../common/styles/Auth/loginScreen.styled"

// Definindo tipos para navegação
type RootStackParamList = {
  Login: undefined
  TwoFactorVerification: undefined
  Dashboard: undefined
}

type TwoFactorVerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, "TwoFactorVerification">

interface TwoFactorVerificationScreenProps {
  navigation: TwoFactorVerificationScreenNavigationProp
}

const TwoFactorVerificationScreen: React.FC<TwoFactorVerificationScreenProps> = ({ navigation }) => {
  // Estados
  const [code, setCode] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // Context
  const { verifyTwoFactor, isLoading, twoFactorPending, pendingToken, pendingUser } = useAuth()

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Referências
  const codeInputRef = useRef<TextInput>(null)

  // Debug: verificar se os dados necessários estão disponíveis
  useEffect(() => {
    console.log('[TwoFactorVerificationScreen] Componente montado')
    console.log('[TwoFactorVerificationScreen] twoFactorPending:', twoFactorPending)
    console.log('[TwoFactorVerificationScreen] pendingToken:', pendingToken ? 'presente' : 'ausente')
    console.log('[TwoFactorVerificationScreen] pendingUser:', pendingUser ? 'presente' : 'ausente')

    if (!twoFactorPending || !pendingToken || !pendingUser) {
      console.error('[TwoFactorVerificationScreen] Dados insuficientes para 2FA, redirecionando para login')
      navigation.replace("Login")
      return
    }
  }, [twoFactorPending, pendingToken, pendingUser, navigation])

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

  // Handler de verificação 2FA
  const handleVerifyCode = async () => {
    Keyboard.dismiss()
    setErrorMessage("")

    if (!code || code.length !== 6) {
      setErrorMessage("Digite um código de 6 dígitos.")
      return
    }

    setLoading(true)

    try {
      await verifyTwoFactor(code)
      // Se chegou aqui, a verificação foi bem-sucedida
      // O contexto já redirecionou para o Dashboard
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Código inválido. Tente novamente."
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  // Handler para voltar ao login
  const handleBackToLogin = () => {
    navigation.replace("Login")
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#4CAF50" />
          <Text style={styles.title}>Verificação de Segurança</Text>
          <Text style={styles.subtitle}>Digite o código de 6 dígitos do seu aplicativo autenticador</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Campo de código */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código de Verificação</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                ref={codeInputRef}
                style={styles.input}
                placeholder="000000"
                value={code}
                onChangeText={(text) => {
                  // Só permite números e limita a 6 dígitos
                  const numericText = text.replace(/[^0-9]/g, '').slice(0, 6)
                  setCode(numericText)
                }}
                maxLength={6}
                keyboardType="numeric"
                autoComplete="one-time-code"
                returnKeyType="done"
                onSubmitEditing={handleVerifyCode}
                autoFocus={true}
              />
            </View>
          </View>

          {/* Mensagem de erro */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={18} color="#e74c3c" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Botão de verificar */}
          <TouchableOpacity
            style={[styles.loginButton, (loading || isLoading) && styles.buttonDisabled]}
            onPress={handleVerifyCode}
            disabled={loading || isLoading}
          >
            {loading || isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.loginButtonText}>Verificar</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Link para voltar ao login */}
          <TouchableOpacity style={styles.forgotPasswordLink} onPress={handleBackToLogin}>
            <Text style={styles.forgotPasswordText}>Voltar ao Login</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  )
}

export default TwoFactorVerificationScreen