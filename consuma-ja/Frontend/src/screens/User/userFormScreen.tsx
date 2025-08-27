"use client"

import { useState, useEffect } from "react"
import { Picker } from "@react-native-picker/picker"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import pessoaService from "../../services/pessoaService"
import { userFormStyles } from "../../common/styles/User/userFormScreen.styled"
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Keyboard, ScrollView } from "react-native"

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

const UserFormScreen = () => {
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
      <View style={userFormStyles.centeredContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={userFormStyles.loadingText}>Carregando dados...</Text>
      </View>
    )

  if (errors.form || !pessoaOriginal)
    return (
      <View style={userFormStyles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#dc3545" />
        <Text style={userFormStyles.errorText}>{errors.form || "Não foi possível carregar."}</Text>
        <TouchableOpacity style={userFormStyles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={userFormStyles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )

  return (
    <ScrollView contentContainerStyle={userFormStyles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={userFormStyles.container}>
        <View style={userFormStyles.header}>
          <Text style={userFormStyles.title}>Editar Usuário</Text>
          {pessoaOriginal && (
            <View style={userFormStyles.headerInfo}>
              <View style={userFormStyles.headerBadge}>
                <Text style={userFormStyles.headerBadgeText}>{pessoaOriginal.pessoa_tipo}</Text>
              </View>
              <Text style={userFormStyles.headerSubtitle}>ID: {pessoaOriginal.pessoa_id}</Text>
            </View>
          )}
        </View>

        {pessoaOriginal && (
          <View style={userFormStyles.formSection}>
            <Text style={userFormStyles.sectionTitle}>Informações Não Editáveis</Text>

            <View style={userFormStyles.inputGroup}>
              <Text style={userFormStyles.label}>Login (CPF/CNPJ/Admin ID):</Text>
              <View style={userFormStyles.readonlyField}>
                <Ionicons name="finger-print-outline" size={20} color="#6c757d" style={userFormStyles.inputIcon} />
                <Text style={userFormStyles.readonlyText}>{pessoaOriginal.pessoa_login}</Text>
              </View>
            </View>

            <View style={userFormStyles.inputGroup}>
              <Text style={userFormStyles.label}>Tipo de Usuário:</Text>
              <View style={userFormStyles.readonlyField}>
                <Ionicons name="people-outline" size={20} color="#6c757d" style={userFormStyles.inputIcon} />
                <Text style={userFormStyles.readonlyText}>{pessoaOriginal.pessoa_tipo}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={userFormStyles.formSection}>
          <Text style={userFormStyles.sectionTitle}>Informações Editáveis</Text>

          <View style={userFormStyles.inputGroup}>
            <Text style={userFormStyles.label}>
              Nome: <Text style={userFormStyles.requiredMark}>*</Text>
            </Text>
            <View style={[userFormStyles.inputWrapper, errors.nome ? userFormStyles.inputError : null]}>
              <Ionicons name="person-outline" size={20} color="#495057" style={userFormStyles.inputIcon} />
              <TextInput
                style={userFormStyles.input}
                value={nome}
                onChangeText={handleNomeChange}
                placeholder="Nome completo"
                autoCapitalize="words"
              />
            </View>
            {errors.nome && <Text style={userFormStyles.errorMessage}>{errors.nome}</Text>}
          </View>

          <View style={userFormStyles.inputGroup}>
            <Text style={userFormStyles.label}>
              Email: <Text style={userFormStyles.requiredMark}>*</Text>
            </Text>
            <View style={[userFormStyles.inputWrapper, errors.email ? userFormStyles.inputError : null]}>
              <Ionicons name="mail-outline" size={20} color="#495057" style={userFormStyles.inputIcon} />
              <TextInput
                style={userFormStyles.input}
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={userFormStyles.errorMessage}>{errors.email}</Text>}
          </View>

          <View style={userFormStyles.inputGroup}>
            <Text style={userFormStyles.label}>
              Telefone: <Text style={userFormStyles.requiredMark}>*</Text>
            </Text>
            <View style={[userFormStyles.inputWrapper, errors.telefone ? userFormStyles.inputError : null]}>
              <Ionicons name="call-outline" size={20} color="#495057" style={userFormStyles.inputIcon} />
              <TextInput
                style={userFormStyles.input}
                value={telefone}
                onChangeText={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
            {errors.telefone && <Text style={userFormStyles.errorMessage}>{errors.telefone}</Text>}
          </View>

          <View style={userFormStyles.inputGroup}>
            <Text style={userFormStyles.label}>
              Status: <Text style={userFormStyles.requiredMark}>*</Text>
            </Text>
            <View style={[userFormStyles.pickerContainer, errors.status ? userFormStyles.inputError : null]}>
              <Picker
                selectedValue={status}
                onValueChange={handleStatusChange}
                style={userFormStyles.picker}
                prompt="Selecione o Status"
              >
                <Picker.Item label="Ativo" value={1} />
                <Picker.Item label="Inativo" value={0} />
              </Picker>
            </View>
            {errors.status && <Text style={userFormStyles.errorMessage}>{errors.status}</Text>}
          </View>
        </View>

        <View style={userFormStyles.buttonContainer}>
          <TouchableOpacity
            style={[userFormStyles.button, userFormStyles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loadingSubmit}
          >
            <Text style={userFormStyles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[userFormStyles.button, userFormStyles.saveButton, loadingSubmit && userFormStyles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loadingSubmit}
          >
            {loadingSubmit ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" style={userFormStyles.buttonIcon} />
                <Text style={userFormStyles.saveButtonText}>Salvar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

export default UserFormScreen
