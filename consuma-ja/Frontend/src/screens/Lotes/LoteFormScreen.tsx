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
  ScrollView,
  Switch,
  Platform,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import Keyboard from "react-native/Libraries/Components/Keyboard/Keyboard"
import promocaoService from "../../services/promocaoService"

// Tipos
interface Produto {
  produto_id: number
  produto_nome: string
  produto_imagem_url?: string | null
}

interface Fornecedor {
  pessoa_id: number
  pessoa_nome: string
}

interface LoteForm {
  lote_id?: number
  produto_id: number | null
  lote_codigo: string
  lote_validade: Date | null
  lote_quantidade_inicial: string
  lote_quantidade_atual: string
  data_entrada: Date
  ativo: boolean
  fornecedor_id?: number | null // Campo opcional para filtrar produtos por fornecedor
}

const ITEMS_PER_PAGE = 10

const LoteFormScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const loteIdParaEditar = route.params?.loteId
  const isEditing = !!loteIdParaEditar
  const produtoPreSelecionado = route.params?.produtoId

  // Estado principal do formulário
  const [formData, setFormData] = useState<LoteForm>({
    produto_id: produtoPreSelecionado || null,
    lote_codigo: "",
    lote_validade: null,
    lote_quantidade_inicial: "",
    lote_quantidade_atual: "",
    data_entrada: new Date(),
    ativo: true,
    fornecedor_id: null,
  })

  // Estados para busca e seleção de produtos
  const [produtoQuery, setProdutoQuery] = useState("")
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  const [produtoPage, setProdutoPage] = useState(1)
  const [produtoTotalPages, setProdutoTotalPages] = useState(0)
  const [showProdutos, setShowProdutos] = useState(false)

  // Estados para busca e seleção de fornecedores (opcional, para filtrar produtos)
  const [fornecedorQuery, setFornecedorQuery] = useState("")
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null)
  const [loadingFornecedores, setLoadingFornecedores] = useState(false)
  const [showFornecedores, setShowFornecedores] = useState(false)

  // Estados para seleção de datas
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState<"validade" | "entrada">("validade")

  // Estado de loading geral
  const [loading, setLoading] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Carregar dados iniciais para edição
  useEffect(() => {
    const loadInitialData = async () => {
      if (isEditing && loteIdParaEditar) {
        setLoading(true)
        try {
          console.log(`[LoteForm] Editando. ID: ${loteIdParaEditar}`)
          const loteDetalhes = await promocaoService.buscarLotePorId(loteIdParaEditar)

          if (loteDetalhes) {
            // Buscar informações do produto
            let produtoInfo = null
            if (loteDetalhes.produto_id) {
              try {
                // Aqui você pode buscar detalhes do produto se necessário
                // ou usar as informações já presentes no loteDetalhes
                produtoInfo = {
                  produto_id: loteDetalhes.produto_id,
                  produto_nome: loteDetalhes.produto?.produto_nome || "Produto",
                  produto_imagem_url: loteDetalhes.produto?.produto_imagem_url,
                }
                setProdutoSelecionado(produtoInfo)
              } catch (e) {
                console.error("Erro ao buscar detalhes do produto na edição", e)
              }
            }

            setFormData({
              lote_id: loteDetalhes.lote_id,
              produto_id: loteDetalhes.produto_id,
              lote_codigo: loteDetalhes.lote_codigo || "",
              lote_validade: loteDetalhes.lote_validade ? new Date(loteDetalhes.lote_validade) : null,
              lote_quantidade_inicial: loteDetalhes.lote_quantidade_inicial?.toString() || "",
              lote_quantidade_atual: loteDetalhes.lote_quantidade_atual?.toString() || "",
              data_entrada: loteDetalhes.data_entrada ? new Date(loteDetalhes.data_entrada) : new Date(),
              ativo: loteDetalhes.ativo === undefined ? true : !!loteDetalhes.ativo,
              fornecedor_id: loteDetalhes.fornecedor_id || null,
            })

            navigation.setOptions({ title: `Editar Lote: ${loteDetalhes.lote_codigo || ""}` })
          } else {
            throw new Error("Lote não encontrado.")
          }
        } catch (error) {
          console.error("Erro loadInitialData:", error)
          Alert.alert("Erro", "Dados iniciais não puderam ser carregados.")
        } finally {
          setLoading(false)
        }
      } else {
        navigation.setOptions({ title: "Novo Lote" })
        
        // Se um produto foi pré-selecionado (passado como parâmetro)
        if (produtoPreSelecionado) {
          try {
            // Buscar informações do produto pré-selecionado
            const produtoInfo = await promocaoService.buscarProdutosParaSelecao({ 
              produtoId: produtoPreSelecionado 
            })
            
            if (produtoInfo && produtoInfo.data && produtoInfo.data.length > 0) {
              const produto = produtoInfo.data[0]
              setProdutoSelecionado(produto)
              setFormData(prev => ({
                ...prev,
                produto_id: produto.produto_id
              }))
            }
          } catch (error) {
            console.error("Erro ao buscar produto pré-selecionado:", error)
          }
        }
      }
    }

    loadInitialData()
  }, [isEditing, loteIdParaEditar, navigation, produtoPreSelecionado])

  // Buscar fornecedores
  const buscarFornecedores = useCallback(async () => {
    if (!fornecedorQuery.trim()) {
      setFornecedores([])
      setShowFornecedores(false)
      return
    }

    setLoadingFornecedores(true)
    try {
      const params = { 
        nomeQuery: fornecedorQuery.trim(),
        page: 1,
        limit: ITEMS_PER_PAGE
      }

      const result = await promocaoService.listarFornecedoresAtivos(params)

      if (result && result.data && result.data.length > 0) {
        setFornecedores(result.data)
        setShowFornecedores(true)
      } else {
        setFornecedores([])
        Alert.alert("Busca", "Nenhum fornecedor encontrado.")
      }
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error)
      Alert.alert("Erro", "Não foi possível buscar fornecedores.")
      setFornecedores([])
    } finally {
      setLoadingFornecedores(false)
    }
  }, [fornecedorQuery])

  // Buscar produtos
  const buscarProdutos = useCallback(
    async (page = 1, append = false) => {
      if (!produtoQuery.trim() && page === 1) {
        setProdutos([])
        setShowProdutos(false)
        return
      }

      setLoadingProdutos(true)
      try {
        const filtros: any = {
          nomeQuery: produtoQuery.trim(),
          page,
          limit: ITEMS_PER_PAGE,
        }

        // Adicionar filtro de fornecedor se selecionado
        if (formData.fornecedor_id) {
          filtros.fornecedorId = formData.fornecedor_id
        }

        const result = await promocaoService.listarTodosProdutos(filtros)

        if (result && result.data && result.data.length > 0) {
          setProdutos(append ? [...produtos, ...result.data] : result.data)
          setProdutoPage(result.page || 1)
          setProdutoTotalPages(result.totalPages || 0)
          setShowProdutos(true)
        } else if (!append) {
          setProdutos([])
          Alert.alert("Busca", "Nenhum produto encontrado.")
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        Alert.alert("Erro", "Não foi possível buscar produtos.")
        if (!append) setProdutos([])
      } finally {
        setLoadingProdutos(false)
      }
    },
    [produtoQuery, produtos, formData.fornecedor_id],
  )

  // Selecionar fornecedor
  const selecionarFornecedor = (fornecedor: Fornecedor) => {
    setFornecedorSelecionado(fornecedor)
    setFormData((prev) => ({
      ...prev,
      fornecedor_id: fornecedor.pessoa_id,
    }))
    setShowFornecedores(false)
    setFornecedorQuery("")
    Keyboard.dismiss()
  }

  // Remover fornecedor
  const removerFornecedor = () => {
    setFornecedorSelecionado(null)
    setFormData((prev) => ({
      ...prev,
      fornecedor_id: null,
    }))
  }

  // Selecionar produto
  const selecionarProduto = (produto: Produto) => {
    setProdutoSelecionado(produto)
    setFormData((prev) => ({
      ...prev,
      produto_id: produto.produto_id,
    }))
    setShowProdutos(false)
    setProdutoQuery("")
    Keyboard.dismiss()
  }

  // Remover produto
  const removerProduto = () => {
    setProdutoSelecionado(null)
    setFormData((prev) => ({
      ...prev,
      produto_id: null,
    }))
  }

  // Formatar data para exibição
  const formatarData = (date: Date | null) => {
    if (!date) return "Selecione uma data"
    return date.toLocaleDateString("pt-BR")
  }

  // Mostrar seletor de data
  const mostrarDatePicker = (mode: "validade" | "entrada") => {
    setDatePickerMode(mode)
    setShowDatePicker(true)
  }

  // Confirmar data selecionada
  const confirmarData = (date: Date) => {
    setShowDatePicker(false)

    if (datePickerMode === "validade") {
      setFormData((prev) => ({
        ...prev,
        lote_validade: date,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        data_entrada: date,
      }))
    }
  }

  // Validar formulário
  const validarFormulario = (): boolean => {
    const erros: { [key: string]: string } = {}

    if (!formData.produto_id) {
      erros.produto = "Selecione um produto"
    }

    if (!formData.lote_codigo.trim()) {
      erros.lote_codigo = "Código do lote é obrigatório"
    }

    if (!formData.lote_quantidade_inicial.trim()) {
      erros.lote_quantidade_inicial = "Quantidade inicial é obrigatória"
    } else {
      const qtdInicial = Number.parseFloat(formData.lote_quantidade_inicial.replace(",", "."))
      if (isNaN(qtdInicial) || qtdInicial <= 0) {
        erros.lote_quantidade_inicial = "Quantidade inicial deve ser um número positivo"
      }
    }

    if (!formData.lote_quantidade_atual.trim()) {
      erros.lote_quantidade_atual = "Quantidade atual é obrigatória"
    } else {
      const qtdAtual = Number.parseFloat(formData.lote_quantidade_atual.replace(",", "."))
      if (isNaN(qtdAtual) || qtdAtual < 0) {
        erros.lote_quantidade_atual = "Quantidade atual deve ser um número não negativo"
      }
    }

    // Verificar se quantidade atual não é maior que a inicial
    const qtdInicial = Number.parseFloat(formData.lote_quantidade_inicial.replace(",", "."))
    const qtdAtual = Number.parseFloat(formData.lote_quantidade_atual.replace(",", "."))
    if (!isNaN(qtdInicial) && !isNaN(qtdAtual) && qtdAtual > qtdInicial) {
      erros.lote_quantidade_atual = "Quantidade atual não pode ser maior que a inicial"
    }

    setErrors(erros)
    return Object.keys(erros).length === 0
  }

  // Preparar dados para envio
  const prepararDadosParaEnvio = () => {
    return {
      ...(isEditing && { lote_id: formData.lote_id }),
      produto_id: formData.produto_id,
      lote_codigo: formData.lote_codigo,
      lote_validade: formData.lote_validade ? formData.lote_validade.toISOString() : null,
      lote_quantidade_inicial: Number.parseFloat(formData.lote_quantidade_inicial.replace(",", ".")),
      lote_quantidade_atual: Number.parseFloat(formData.lote_quantidade_atual.replace(",", ".")),
      data_entrada: formData.data_entrada.toISOString(),
      ativo: formData.ativo,
    }
  }

  // Enviar formulário
  const enviarFormulario = async () => {
    Keyboard.dismiss()

    if (!validarFormulario()) {
      Alert.alert("Erro", "Corrija os erros no formulário antes de continuar.")
      return
    }

    setLoadingSubmit(true)
    try {
      const dadosParaEnvio = prepararDadosParaEnvio()

      let resultado
      if (isEditing && formData.lote_id) {
        resultado = await promocaoService.atualizarLote(formData.lote_id, dadosParaEnvio)
      } else {
        resultado = await promocaoService.criarLote(dadosParaEnvio)
      }

      Alert.alert(
        "Sucesso", 
        isEditing ? "Lote atualizado com sucesso!" : "Lote criado com sucesso!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      )
    } catch (error) {
      console.error("Erro ao salvar lote:", error)
      Alert.alert("Erro", "Ocorreu um erro ao salvar o lote.")
    } finally {
      setLoadingSubmit(false)
    }
  }

  if (loading && isEditing) {
    return <ActivityIndicator size="large" style={styles.centered} />
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{isEditing ? "Editar Lote" : "Novo Lote"}</Text>

      {/* Fornecedor (opcional, para filtrar produtos) */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Fornecedor (opcional, para filtrar produtos):</Text>
        {fornecedorSelecionado ? (
          <View style={styles.selectedItem}>
            <Text style={styles.selectedItemText}>{fornecedorSelecionado.pessoa_nome}</Text>
            <TouchableOpacity onPress={removerFornecedor} style={styles.removeButton}>
              <Ionicons name="close-circle" size={24} color="#dc3545" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={fornecedorQuery}
                onChangeText={setFornecedorQuery}
                placeholder="Buscar fornecedor..."
                onSubmitEditing={buscarFornecedores}
                editable={!loadingFornecedores}
              />
              <TouchableOpacity
                style={[styles.searchButton, loadingFornecedores && styles.buttonDisabled]}
                onPress={buscarFornecedores}
                disabled={loadingFornecedores}
              >
                {loadingFornecedores ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.searchButtonText}>Buscar</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {showFornecedores && (
          <View style={styles.resultsContainer}>
            <ScrollView style={styles.resultsList} nestedScrollEnabled={true}>
              {fornecedores.map((item) => (
                <TouchableOpacity
                  key={item.pessoa_id.toString()}
                  style={styles.resultItem}
                  onPress={() => selecionarFornecedor(item)}
                >
                  <Text style={styles.resultItemText}>{item.pessoa_nome}</Text>
                  <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Produto */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Produto:</Text>
        {produtoSelecionado ? (
          <View style={styles.selectedItem}>
            <Text style={styles.selectedItemText}>{produtoSelecionado.produto_nome}</Text>
            <TouchableOpacity onPress={removerProduto} style={styles.removeButton} disabled={isEditing}>
              <Ionicons name="close-circle" size={24} color={isEditing ? "#aaa" : "#dc3545"} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, errors.produto ? styles.inputError : null]}
                value={produtoQuery}
                onChangeText={setProdutoQuery}
                placeholder="Buscar produto..."
                onSubmitEditing={() => buscarProdutos(1, false)}
                editable={!loadingProdutos && !isEditing}
              />
              <TouchableOpacity
                style={[styles.searchButton, (loadingProdutos || isEditing) && styles.buttonDisabled]}
                onPress={() => buscarProdutos(1, false)}
                disabled={loadingProdutos || isEditing}
              >
                {loadingProdutos ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.searchButtonText}>Buscar</Text>
                )}
              </TouchableOpacity>
            </View>
            {errors.produto ? <Text style={styles.errorText}>{errors.produto}</Text> : null}
          </>
        )}

        {showProdutos && !isEditing && (
          <View style={styles.resultsContainer}>
            <ScrollView style={styles.resultsList} nestedScrollEnabled={true}>
              {produtos.map((item) => (
                <TouchableOpacity
                  key={item.produto_id.toString()}
                  style={styles.resultItem}
                  onPress={() => selecionarProduto(item)}
                >
                  <Text style={styles.resultItemText}>{item.produto_nome}</Text>
                  <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Código do Lote */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Código do Lote:</Text>
        <TextInput
          style={[styles.input, errors.lote_codigo ? styles.inputError : null]}
          value={formData.lote_codigo}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, lote_codigo: text }))}
          placeholder="Ex: LOT-2023-001"
          editable={!isEditing} // Não permitir editar o código do lote em modo de edição
        />
        {errors.lote_codigo ? <Text style={styles.errorText}>{errors.lote_codigo}</Text> : null}
      </View>

      {/* Data de Validade */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Data de Validade:</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => mostrarDatePicker("validade")}>
          <Text>{formData.lote_validade ? formatarData(formData.lote_validade) : "Selecione a data de validade"}</Text>
          <Ionicons name="calendar-outline" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Quantidade Inicial */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Quantidade Inicial:</Text>
        <TextInput
          style={[styles.input, errors.lote_quantidade_inicial ? styles.inputError : null]}
          value={formData.lote_quantidade_inicial}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, lote_quantidade_inicial: text }))}
          keyboardType="numeric"
          placeholder="Ex: 100"
          editable={!isEditing} // Não permitir editar a quantidade inicial em modo de edição
        />
        {errors.lote_quantidade_inicial ? (
          <Text style={styles.errorText}>{errors.lote_quantidade_inicial}</Text>
        ) : null}
      </View>

      {/* Quantidade Atual */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Quantidade Atual:</Text>
        <TextInput
          style={[styles.input, errors.lote_quantidade_atual ? styles.inputError : null]}
          value={formData.lote_quantidade_atual}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, lote_quantidade_atual: text }))}
          keyboardType="numeric"
          placeholder="Ex: 100"
        />
        {errors.lote_quantidade_atual ? <Text style={styles.errorText}>{errors.lote_quantidade_atual}</Text> : null}
      </View>

      {/* Data de Entrada */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Data de Entrada:</Text>
        <TouchableOpacity 
          style={styles.dateInput} 
          onPress={() => mostrarDatePicker("entrada")}
          disabled={isEditing} // Não permitir editar a data de entrada em modo de edição
        >
          <Text>{formatarData(formData.data_entrada)}</Text>
          <Ionicons name="calendar-outline" size={20} color={isEditing ? "#aaa" : "#555"} />
        </TouchableOpacity>
      </View>

      {/* Status (Ativo/Inativo) */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Status:</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>{formData.ativo ? "Ativo" : "Inativo"}</Text>
          <Switch
            value={formData.ativo}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, ativo: value }))}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={formData.ativo ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>

      {/* Botão Salvar */}
      <TouchableOpacity
        style={[styles.submitButton, loadingSubmit && styles.buttonDisabled]}
        onPress={enviarFormulario}
        disabled={loadingSubmit}
      >
        {loadingSubmit ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{isEditing ? "Atualizar Lote" : "Salvar Lote"}</Text>
        )}
      </TouchableOpacity>

      {/* DateTimePicker */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={confirmarData}
        onCancel={() => setShowDatePicker(false)}
        date={datePickerMode === "validade" ? (formData.lote_validade || new Date()) : formData.data_entrada}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#212529",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#495057",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
    justifyContent: "center",
    minWidth: 80,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },
  resultsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  resultItemText: {
    fontSize: 14,
    color: "#212529",
  },
  selectedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e9f7ef",
    borderColor: "#d1e7dd",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
  },
  selectedItemText: {
    fontSize: 16,
    color: "#0f5132",
  },
  removeButton: {
    padding: 4,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: "#212529",
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
})

export default LoteFormScreen
