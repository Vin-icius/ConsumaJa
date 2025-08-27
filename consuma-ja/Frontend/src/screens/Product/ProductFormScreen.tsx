"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Keyboard, // Importação correta do Keyboard
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { useNavigation, useRoute } from "@react-navigation/native"
// Removida a importação direta do Keyboard que causava o erro
// import Keyboard from "react-native/Libraries/Components/Keyboard/Keyboard"
import produtoService from "../../services/produtoService"
import categoriaService from "../../services/categoriaService"
import marcaService from "../../services/marcaService"
import tipoService from "../../services/tipoService"
import { productFormStyles } from "../../common/styles/Product/productFormScreen.styled"

// Tipos
interface CategoriaItem {
  categoria_id: number
  categoria_nome: string
}

interface MarcaItem {
  marca_id: number
  marca_nome: string
}

interface TipoItem {
  tipo_id: number
  tipo_nome: string
}

interface ProdutoFormData {
  produto_nome: string
  produto_medida: string
  produto_precoOriginal: string
  descricao: string
  categoriaId: number | undefined
  marcaId: number | undefined
  tipoId: number | undefined
}

const ProductFormScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()

  const produtoParaEditarId = route.params?.produtoParaEditarId
  const isEditing = !!produtoParaEditarId

  // Estados do formulário
  const [formData, setFormData] = useState<ProdutoFormData>({
    produto_nome: "",
    produto_medida: "",
    produto_precoOriginal: "",
    descricao: "",
    categoriaId: undefined,
    marcaId: undefined,
    tipoId: undefined,
  })

  // Estados para seletores
  const [categorias, setCategorias] = useState<CategoriaItem[]>([])
  const [marcas, setMarcas] = useState<MarcaItem[]>([])
  const [tipos, setTipos] = useState<TipoItem[]>([])

  // Estados de loading e erros
  const [loading, setLoading] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({})

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setErrors({})
      try {
        // Buscar categorias, marcas e tipos
        const [catRes, marRes, tipRes, prodRes] = await Promise.all([
          categoriaService.listarCategorias(),
          marcaService.listarMarcas(),
          tipoService.listarTipos(),
          isEditing ? produtoService.getProdutoById(produtoParaEditarId) : Promise.resolve(null),
        ])

        setCategorias(catRes || [])
        setMarcas(marRes || [])
        setTipos(tipRes || [])

        // Se estiver editando, preencher o formulário com os dados do produto
        if (isEditing && prodRes) {
          const produto = prodRes
          setFormData({
            produto_nome: produto.produto_nome || "",
            produto_medida: produto.produto_medida || "",
            produto_precoOriginal: produto.produto_precoOriginal?.toString() || "",
            descricao: produto.descricao || "",
            categoriaId: Number(produto.CATEGORIA_PRODUTO_categoria_id) || undefined,
            marcaId: Number(produto.MARCA_PRODUTO_marca_id) || undefined,
            tipoId: Number(produto.TIPO_PRODUTO_tipo_id) || undefined,
          })
          navigation.setOptions({ title: `Editar: ${produto.produto_nome || "Produto"}` })
        } else {
          navigation.setOptions({ title: "Novo Produto" })
        }
      } catch (error: any) {
        console.error("Erro ao carregar dados do formulário:", error)
        setErrors({ form: "Erro ao carregar dados. Verifique conexão/backend." })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isEditing, produtoParaEditarId, navigation])

  // Atualizar campo de texto
  const handleInputChange = (field: keyof ProdutoFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Atualizar campo de seletor
  const handlePickerChange = (field: "categoriaId" | "marcaId" | "tipoId", itemValue: any) => {
    const numericValue =
      itemValue === null || itemValue === undefined || itemValue === "" ? undefined : Number(itemValue)
    setFormData((prev) => ({ ...prev, [field]: numericValue }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Validar formulário
  const validarFormulario = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.produto_nome.trim()) {
      newErrors.produto_nome = "Nome é obrigatório"
    } else if (formData.produto_nome.trim().length < 3) {
      newErrors.produto_nome = "Nome deve ter pelo menos 3 caracteres"
    }

    if (!formData.produto_medida.trim()) {
      newErrors.produto_medida = "Medida é obrigatória"
    }

    if (!formData.produto_precoOriginal.trim()) {
      newErrors.produto_precoOriginal = "Preço é obrigatório"
    } else if (isNaN(Number(formData.produto_precoOriginal)) || Number(formData.produto_precoOriginal) <= 0) {
      newErrors.produto_precoOriginal = "Preço inválido"
    }

    if (formData.categoriaId === undefined) {
      newErrors.categoriaId = "Selecione a Categoria"
    }

    if (formData.marcaId === undefined) {
      newErrors.marcaId = "Selecione a Marca"
    }

    if (formData.tipoId === undefined) {
      newErrors.tipoId = "Selecione o Tipo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar formulário
  const handleSubmit = async () => {
    // Usando a API Keyboard padrão do React Native
    Keyboard.dismiss()

    if (!validarFormulario()) {
      Alert.alert("Erro", "Corrija os erros no formulário antes de continuar.")
      return
    }

    setLoadingSubmit(true)
    try {
      const payload = {
        produto_nome: formData.produto_nome.trim(),
        produto_medida: formData.produto_medida.trim(),
        produto_precoOriginal: Number(formData.produto_precoOriginal),
        descricao: formData.descricao.trim() || null,
        CATEGORIA_PRODUTO_categoria_id: Number(formData.categoriaId),
        MARCA_PRODUTO_marca_id: Number(formData.marcaId),
        TIPO_PRODUTO_tipo_id: Number(formData.tipoId),
      }

      if (isEditing) {
        await produtoService.atualizarProduto(produtoParaEditarId, payload)
        Alert.alert("Sucesso", "Produto atualizado com sucesso!")
      } else {
        await produtoService.criarProduto(payload as any)
        Alert.alert("Sucesso", "Produto criado com sucesso!")
      }

      navigation.goBack()
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error)
      const defaultMessage = isEditing ? "Não foi possível atualizar o produto." : "Não foi possível criar o produto."
      const message = error.response?.data?.message || error.message || defaultMessage
      Alert.alert("Erro", message)
    } finally {
      setLoadingSubmit(false)
    }
  }

  // Renderizar seletor
  const renderPicker = (
    label: string,
    fieldName: "categoriaId" | "marcaId" | "tipoId",
    selectedValue: number | undefined,
    items: any[],
    itemKeyProp: string,
    itemLabelProp: string,
  ) => {
    return (
      <View style={productFormStyles.formGroup}>
        <Text style={productFormStyles.label}>{label}:</Text>
        <View style={[productFormStyles.pickerContainer, errors[fieldName] ? productFormStyles.inputError : null]}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={(itemValue) => handlePickerChange(fieldName, itemValue)}
            style={productFormStyles.picker}
            enabled={!loading}
          >
            <Picker.Item label={`Selecione ${label}`} value={undefined} />
            {items.map((item) => (
              <Picker.Item key={item[itemKeyProp]} label={item[itemLabelProp]} value={item[itemKeyProp]} />
            ))}
          </Picker>
        </View>
        {errors[fieldName] ? <Text style={productFormStyles.errorText}>{errors[fieldName]}</Text> : null}
      </View>
    )
  }

  if (loading && isEditing) {
    return <ActivityIndicator size="large" style={productFormStyles.centered} />
  }

  if (errors.form) {
    return (
      <View style={productFormStyles.centered}>
        <Text style={productFormStyles.errorText}>{errors.form}</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={productFormStyles.container}
      contentContainerStyle={productFormStyles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={productFormStyles.title}>{isEditing ? "Editar Produto" : "Novo Produto"}</Text>

      {/* Nome do Produto */}
      <View style={productFormStyles.formGroup}>
        <Text style={productFormStyles.label}>Nome do Produto:</Text>
        <TextInput
          style={[productFormStyles.input, errors.produto_nome ? productFormStyles.inputError : null]}
          value={formData.produto_nome}
          onChangeText={(text) => handleInputChange("produto_nome", text)}
          placeholder="Nome do Produto"
        />
        {errors.produto_nome ? <Text style={productFormStyles.errorText}>{errors.produto_nome}</Text> : null}
      </View>

      {/* Medida */}
      <View style={productFormStyles.formGroup}>
        <Text style={productFormStyles.label}>Medida:</Text>
        <TextInput
          style={[productFormStyles.input, errors.produto_medida ? productFormStyles.inputError : null]}
          value={formData.produto_medida}
          onChangeText={(text) => handleInputChange("produto_medida", text)}
          placeholder="Ex: Kg, Lt, Un"
        />
        {errors.produto_medida ? <Text style={productFormStyles.errorText}>{errors.produto_medida}</Text> : null}
      </View>

      {/* Preço Original */}
      <View style={productFormStyles.formGroup}>
        <Text style={productFormStyles.label}>Preço Original (R$):</Text>
        <TextInput
          style={[productFormStyles.input, errors.produto_precoOriginal ? productFormStyles.inputError : null]}
          value={formData.produto_precoOriginal}
          onChangeText={(text) => handleInputChange("produto_precoOriginal", text.replace(/[^0-9.]/g, ""))}
          placeholder="Ex: 10.99"
          keyboardType="numeric"
        />
        {errors.produto_precoOriginal ? <Text style={productFormStyles.errorText}>{errors.produto_precoOriginal}</Text> : null}
      </View>

      {/* Descrição */}
      <View style={productFormStyles.formGroup}>
        <Text style={productFormStyles.label}>Descrição:</Text>
        <TextInput
          style={[productFormStyles.input, productFormStyles.textArea]}
          value={formData.descricao}
          onChangeText={(text) => handleInputChange("descricao", text)}
          placeholder="(Opcional)"
          multiline
        />
      </View>

      {/* Seletores */}
      {renderPicker("Categoria", "categoriaId", formData.categoriaId, categorias, "categoria_id", "categoria_nome")}
      {renderPicker("Marca", "marcaId", formData.marcaId, marcas, "marca_id", "marca_nome")}
      {renderPicker("Tipo", "tipoId", formData.tipoId, tipos, "tipo_id", "tipo_nome")}

      {/* Botão Salvar */}
      <TouchableOpacity
        style={[productFormStyles.submitButton, (loadingSubmit || loading) && productFormStyles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loadingSubmit || loading}
      >
        {loadingSubmit ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={productFormStyles.submitButtonText}>{isEditing ? "Atualizar Produto" : "Salvar Produto"}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

export default ProductFormScreen
