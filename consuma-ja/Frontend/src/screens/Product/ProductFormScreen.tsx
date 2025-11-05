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
  Keyboard,
  Image,
  Platform,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import * as ImagePicker from "expo-image-picker"
import { useNavigation, useRoute } from "@react-navigation/native"
// Removida a importação direta do Keyboard que causava o erro
// import Keyboard from "react-native/Libraries/Components/Keyboard/Keyboard"
import produtoService from "../../services/produtoService"
import categoriaService from "../../services/categoriaService"
import marcaService from "../../services/marcaService"
import tipoService from "../../services/tipoService"
import { productFormStyles } from "../../common/styles/Product/productFormScreen.styled"
import { resolveProductImageUrl } from "../../utils/image"

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

type SelectedImageFile = {
  uri: string
  name: string
  type: string
}

const buildImageFormData = async (image: SelectedImageFile | null): Promise<FormData | null> => {
  if (!image) return null
  const formData = new FormData()

  if (Platform.OS === "web") {
    const response = await fetch(image.uri)
    const blob = await response.blob()
    const mimeType = image.type || blob.type || "image/jpeg"
    formData.append("imagem", blob, image.name || `produto-${Date.now()}.jpg`)
    return formData
  }

  formData.append("imagem", {
    uri: image.uri,
    name: image.name || `produto-${Date.now()}.jpg`,
    type: image.type || "image/jpeg",
  } as any)
  return formData
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
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<SelectedImageFile | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

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
          const resolvedImagem = resolveProductImageUrl(produto.produto_imagem_url) ?? null
          setSelectedImagePreview(resolvedImagem)
          setSelectedImageFile(null)
          navigation.setOptions({ title: `Editar: ${produto.produto_nome || "Produto"}` })
        } else {
          navigation.setOptions({ title: "Novo Produto" })
          setSelectedImagePreview(null)
          setSelectedImageFile(null)
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

  const applySelectedAsset = (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset || !asset.uri) return
  const generatedName = asset.fileName || `produto-${Date.now()}.jpg`
  const mimeType = asset.mimeType || "image/jpeg"
    setSelectedImageFile({ uri: asset.uri, name: generatedName, type: mimeType })
    setSelectedImagePreview(asset.uri)
  }

  const ensureLibraryPermission = async (): Promise<boolean> => {
    if (Platform.OS === "web") {
      return true
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar a foto do produto.')
      return false
    }
    return true
  }

  const ensureCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === "web") {
      Alert.alert("Recurso indisponível", "O uso da câmera não é suportado nesta plataforma.")
      return false
    }
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para fotografar o produto.')
      return false
    }
    return true
  }

  const pickImageFromLibrary = async () => {
    const allowed = await ensureLibraryPermission()
    if (!allowed) return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    })
    if (!result.canceled && result.assets?.length) {
      applySelectedAsset(result.assets[0])
    }
  }

  const openCamera = async () => {
    const allowed = await ensureCameraPermission()
    if (!allowed) return
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    })
    if (!result.canceled && result.assets?.length) {
      applySelectedAsset(result.assets[0])
    }
  }

  const handleSelectImage = () => {
    if (uploadingImage || loadingSubmit) {
      return
    }
    if (Platform.OS === "web") {
      pickImageFromLibrary()
      return
    }
    Alert.alert("Foto do produto", "Selecione a origem da imagem", [
      { text: "Câmera", onPress: openCamera },
      { text: "Galeria", onPress: pickImageFromLibrary },
      { text: "Cancelar", style: "cancel" },
    ])
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

  const uploadImagemProduto = async (produtoId: number) => {
    const formData = await buildImageFormData(selectedImageFile)
    if (!formData) {
      return null
    }
    setUploadingImage(true)
    try {
      const response = await produtoService.uploadProdutoImagem(produtoId, formData)
      const produtoAtualizado = response?.produto
      if (produtoAtualizado?.produto_imagem_url) {
        setSelectedImagePreview(resolveProductImageUrl(produtoAtualizado.produto_imagem_url))
      }
      setSelectedImageFile(null)
      return produtoAtualizado
    } catch (error) {
      console.error("Erro ao enviar imagem do produto:", error)
      throw error
    } finally {
      setUploadingImage(false)
    }
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
        const produtoAtualizado = await produtoService.atualizarProduto(produtoParaEditarId, payload)
        if (!selectedImageFile && produtoAtualizado?.produto_imagem_url) {
          setSelectedImagePreview(resolveProductImageUrl(produtoAtualizado.produto_imagem_url))
        }
        if (selectedImageFile) {
          const produtoIdUpload = produtoAtualizado?.produto_id ?? Number(produtoParaEditarId)
          if (produtoIdUpload) {
            try {
              await uploadImagemProduto(produtoIdUpload)
            } catch (uploadError) {
              console.error("Erro ao atualizar imagem do produto:", uploadError)
              Alert.alert(
                "Imagem não enviada",
                "O produto foi atualizado, mas ocorreu um erro ao enviar a nova imagem. Tente novamente.",
              )
            }
          }
        }
        Alert.alert("Sucesso", "Produto atualizado com sucesso!")
      } else {
        const novoProduto = await produtoService.criarProduto(payload as any)
        if (novoProduto?.produto_imagem_url && !selectedImageFile) {
          setSelectedImagePreview(resolveProductImageUrl(novoProduto.produto_imagem_url))
        }
        if (selectedImageFile && novoProduto?.produto_id) {
          try {
            await uploadImagemProduto(novoProduto.produto_id)
          } catch (uploadError) {
            console.error("Erro ao enviar imagem do novo produto:", uploadError)
            Alert.alert(
              "Imagem não enviada",
              "Produto criado, mas ocorreu um erro ao enviar a foto. Você pode editar o produto e tentar novamente.",
            )
          }
        }
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

        <View style={productFormStyles.formGroup}>
          <Text style={productFormStyles.label}>Foto do Produto:</Text>
          <View style={productFormStyles.imagePickerContainer}>
            {selectedImagePreview ? (
              <Image
                source={{ uri: selectedImagePreview }}
                style={productFormStyles.imagePreview}
                resizeMode="cover"
              />
            ) : (
              <View style={productFormStyles.imagePlaceholder}>
                <Text style={productFormStyles.imagePlaceholderText}>Nenhuma foto selecionada</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                productFormStyles.imagePickerButton,
                (uploadingImage || loadingSubmit) && productFormStyles.imagePickerButtonDisabled,
              ]}
              onPress={handleSelectImage}
              disabled={uploadingImage || loadingSubmit}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={productFormStyles.imagePickerButtonText}>
                  {selectedImagePreview ? 'Trocar foto' : 'Selecionar foto'}
                </Text>
              )}
            </TouchableOpacity>

            {selectedImageFile && !uploadingImage && (
              <Text style={productFormStyles.imageUploadingText}>Nova imagem será enviada ao salvar.</Text>
            )}
            {uploadingImage && (
              <Text style={productFormStyles.imageUploadingText}>Enviando imagem...</Text>
            )}
          </View>
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
