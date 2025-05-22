"use client"

import { useState, useEffect } from "react"
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
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import pessoaService from "../../services/pessoaService"

// Definição de tipos
type PessoaStatus = 0 | 1

interface Pessoa {
  pessoa_id: number
  pessoa_nome: string
  pessoa_email: string
  pessoa_telefone?: string
  pessoa_status: PessoaStatus
  pessoa_tipo: string
  pessoa_login: string
  [key: string]: any
}

// Função de formatação (definida fora ou importada)
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

const PessoaFormScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const pessoaId = route.params?.pessoaId // ID vem da lista para edição

  // Estados do formulário
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [status, setStatus] = useState<PessoaStatus>(1) // 1 = Ativo, 0 = Inativo

  // Estados de controle
  const [loadingData, setLoadingData] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [errors, setErrors] = useState<{
    nome?: string
    email?: string
    telefone?: string
    status?: string
    form?: string
  }>({})
  const [pessoaOriginal, setPessoaOriginal] = useState<Pessoa | null>(null)

  // Handlers para atualização de campos
  const handleNomeChange = (text: string) => {
    setNome(text)
    if (errors.nome) {
      setErrors((prev) => ({ ...prev, nome: undefined }))
    }
  }

  const handleEmailChange = (text: string) => {
    setEmail(text)
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }))
    }
  }

  const handleTelefoneChange = (text: string) => {
    const formattedText = formatTelefone(text)
    setTelefone(formattedText)
    if (errors.telefone) {
      setErrors((prev) => ({ ...prev, telefone: undefined }))
    }
  }

  const handleStatusChange = (value: PessoaStatus) => {
    setStatus(value)
    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: undefined }))
    }
  }

  // Busca dados da pessoa ao carregar
  useEffect(() => {
    let isMounted = true

    const fetchPessoa = async () => {
      if (!pessoaId) {
        Alert.alert("Erro", "ID não fornecido.")
        navigation.goBack()
        return
      }

      setLoadingData(true)
      setErrors({})

      try {
        const data = await pessoaService.buscarPessoaPorId(pessoaId)
        if (isMounted) {
          if (data) {
            setPessoaOriginal(data)
            setNome(data.pessoa_nome || "")
            setEmail(data.pessoa_email || "")
            setTelefone(formatTelefone(data.pessoa_telefone || ""))
            setStatus(data.pessoa_status ?? 1)
            navigation.setOptions({ title: `Editar: ${data.pessoa_nome.split(" ")[0]}` }) // Título mais curto
          } else {
            throw new Error("Pessoa não encontrada.")
          }
        }
      } catch (error: any) {
        console.error("Erro ao buscar pessoa:", error)
        if (isMounted) setErrors({ form: "Erro ao carregar dados." })
      } finally {
        if (isMounted) setLoadingData(false)
      }
    }

    fetchPessoa()
    return () => {
      isMounted = false
    }
  }, [pessoaId, navigation])

  // Validação
  const validarCampos = (): boolean => {
    const newErrors: {
      nome?: string
      email?: string
      telefone?: string
      status?: string
    } = {}

    if (!nome.trim()) newErrors.nome = "Nome obrigatório"
    if (!email.includes("@")) newErrors.email = "Email inválido"
    if (!telefone || telefone.replace(/\D/g, "").length < 10) newErrors.telefone = "Telefone inválido"
    if (status !== 0 && status !== 1) newErrors.status = "Status inválido"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit
  const handleSubmit = async () => {
    Keyboard.dismiss()
    if (!validarCampos()) {
      Alert.alert("Erro", "Verifique os campos.")
      return
    }
    setLoadingSubmit(true)
    setErrors({})

    try {
      // Atualizar pessoa existente
      const payload = {
        pessoa_nome: nome.trim(),
        pessoa_email: email.trim().toLowerCase(),
        pessoa_telefone: telefone.replace(/\D/g, "") || null,
        pessoa_status: status,
      }

      await pessoaService.atualizarPessoa(pessoaId, payload)
      Alert.alert("Sucesso", "Dados do usuário atualizados!")
      navigation.goBack()
    } catch (err: any) {
      console.error("Erro ao atualizar pessoa:", err)
      const message = err.response?.data?.message || err.message || "Erro ao atualizar usuário."

      if (err.response?.status === 409) {
        Alert.alert("Conflito", message)
      } else {
        Alert.alert("Erro", message)
      }
    } finally {
      setLoadingSubmit(false)
    }
  }

  // --- Renderização ---
  if (loadingData)
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    )

  if (errors.form || !pessoaOriginal)
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#dc3545" />
        <Text style={styles.errorText}>{errors.form || "Não foi possível carregar."}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Editar Usuário</Text>
          {pessoaOriginal && (
            <View style={styles.headerInfo}>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{pessoaOriginal.pessoa_tipo}</Text>
              </View>
              <Text style={styles.headerSubtitle}>ID: {pessoaOriginal.pessoa_id}</Text>
            </View>
          )}
        </View>

        {pessoaOriginal && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informações Não Editáveis</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Login (CPF/CNPJ/Admin ID):</Text>
              <View style={styles.readonlyField}>
                <Ionicons name="finger-print-outline" size={20} color="#6c757d" style={styles.inputIcon} />
                <Text style={styles.readonlyText}>{pessoaOriginal.pessoa_login}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Usuário:</Text>
              <View style={styles.readonlyField}>
                <Ionicons name="people-outline" size={20} color="#6c757d" style={styles.inputIcon} />
                <Text style={styles.readonlyText}>{pessoaOriginal.pessoa_tipo}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informações Editáveis</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nome: <Text style={styles.requiredMark}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, errors.nome ? styles.inputError : null]}>
              <Ionicons name="person-outline" size={20} color="#495057" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={handleNomeChange}
                placeholder="Nome completo"
                autoCapitalize="words"
              />
            </View>
            {errors.nome && <Text style={styles.errorMessage}>{errors.nome}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email: <Text style={styles.requiredMark}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
              <Ionicons name="mail-outline" size={20} color="#495057" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={styles.errorMessage}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Telefone: <Text style={styles.requiredMark}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, errors.telefone ? styles.inputError : null]}>
              <Ionicons name="call-outline" size={20} color="#495057" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
            {errors.telefone && <Text style={styles.errorMessage}>{errors.telefone}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Status: <Text style={styles.requiredMark}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, errors.status ? styles.inputError : null]}>
              <Picker
                selectedValue={status}
                onValueChange={handleStatusChange}
                style={styles.picker}
                prompt="Selecione o Status"
              >
                <Picker.Item label="Ativo" value={1} />
                <Picker.Item label="Inativo" value={0} />
              </Picker>
            </View>
            {errors.status && <Text style={styles.errorMessage}>{errors.status}</Text>}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loadingSubmit}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, loadingSubmit && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loadingSubmit}
          >
            {loadingSubmit ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>Salvar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 30, // Adicionar padding na parte inferior
  },
  container: {
    flex: 1,
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6c757d",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 8,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBadge: {
    backgroundColor: "#e9ecef",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  headerBadgeText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#343a40",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: "#495057",
    fontWeight: "500",
  },
  requiredMark: {
    color: "#dc3545",
    fontWeight: "bold",
  },
  readonlyField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9ecef",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  readonlyText: {
    fontSize: 16,
    color: "#6c757d",
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#495057",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorMessage: {
    color: "#dc3545",
    fontSize: 13,
    marginTop: 4,
    marginLeft: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    height: 48,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 40, // Aumentar a margem inferior para evitar sobreposição
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 6,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#007bff",
    marginLeft: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonDisabled: {
    backgroundColor: "#a7c7e7",
  },
})

export default PessoaFormScreen
