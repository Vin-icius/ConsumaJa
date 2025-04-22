// src/screens/Product/ProductFormScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Keyboard, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import produtoService from '../../services/produtoService';
import categoriaService from '../../services/categoriaService';
import marcaService from '../../services/marcaService';
import tipoService from '../../services/tipoService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Tipos (ajuste conforme suas interfaces reais)
interface CategoriaItem { categoria_id: number; categoria_nome: string; }
interface MarcaItem { marca_id: number; marca_nome: string; }
interface TipoItem { tipo_id: number; tipo_nome: string; }
// Estado separado para nome
interface ProdutoFormData {
    // produto_nome: string; // Movido para nomeInput
    produto_medida: string;
    produto_precoOriginal: string;
    descricao: string;
    categoriaId: number | undefined; // Usa undefined
    marcaId: number | undefined;     // Usa undefined
    tipoId: number | undefined;      // Usa undefined
}

// Tipagem Navegação (opcional)
// type ProductStackParamList = { ProductList: undefined; ProductForm: { produtoParaEditarId?: number }; };
// type ProductFormNavigationProp = NativeStackNavigationProp<ProductStackParamList, 'ProductForm'>;
// type ProductFormRouteProp = RouteProp<ProductStackParamList, 'ProductForm'>;

const ProductFormScreen = () => {
  console.log('--- ProductFormScreen RENDER ---'); // Log de Render
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const produtoParaEditarId = route.params?.produtoParaEditarId;
  const isEditing = !!produtoParaEditarId;

  // --- Estados do Formulário ---
  const [nomeInput, setNomeInput] = useState(''); // Estado separado para nome
  const [formData, setFormData] = useState<Omit<ProdutoFormData, 'produto_nome'>>({
      produto_medida: '', produto_precoOriginal: '',
      descricao: '', categoriaId: undefined, marcaId: undefined, tipoId: undefined, // Iniciar com undefined
  });
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [marcas, setMarcas] = useState<MarcaItem[]>([]);
  const [tipos, setTipos] = useState<TipoItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProdutoFormData | 'produto_nome' | 'form', string>>>({}); // Inclui produto_nome

  // --- Buscar Dados ---
  const fetchData = useCallback(async () => {
    console.log('[fetchData] Iniciando busca...');
    setLoadingData(true);
    setErrors({});
    try {
      const [catRes, marRes, tipRes, prodRes] = await Promise.all([
        categoriaService.listarCategorias(),
        marcaService.listarMarcas(),
        tipoService.listarTipos(),
        isEditing ? produtoService.getProdutoById(produtoParaEditarId!) : Promise.resolve(null),
      ]);

      console.log('[fetchData] Categorias Recebidas:', catRes);
      console.log('[fetchData] Marcas Recebidas:', marRes);
      console.log('[fetchData] Tipos Recebidos:', tipRes);

      setCategorias(catRes || []);
      setMarcas(marRes || []);
      setTipos(tipRes || []);

      if (isEditing && prodRes) {
        const produto = prodRes;
        setNomeInput(produto.produto_nome || ''); // Define nomeInput
        setFormData({
            produto_medida: produto.produto_medida || '',
            produto_precoOriginal: produto.produto_precoOriginal?.toString() || '',
            descricao: produto.descricao || '',
            // Converte para número ou undefined
            categoriaId: Number(produto.CATEGORIA_PRODUTO_categoria_id) || undefined,
            marcaId: Number(produto.MARCA_PRODUTO_marca_id) || undefined,
            tipoId: Number(produto.TIPO_PRODUTO_tipo_id) || undefined,
        });
        navigation.setOptions({ title: 'Editar Produto' });
      } else if (!isEditing) {
        navigation.setOptions({ title: 'Adicionar Produto' });
      } else if (isEditing && !prodRes) {
        throw new Error("Não foi possível carregar os dados do produto para edição.");
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados do formulário:", error);
      setErrors({ form: "Erro ao carregar dados. Verifique conexão/backend."});
    } finally {
      setLoadingData(false);
      console.log('[fetchData] Busca finalizada.');
    }
  }, [isEditing, produtoParaEditarId, navigation]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Handlers ---
  // Handler para nome (estado separado)
  const handleNomeChange = (value: string) => {
      console.log(`handleNomeChange -> Valor: "${value}"`); // Log
      setNomeInput(value);
      if (errors.produto_nome) { setErrors(prev => ({ ...prev, produto_nome: undefined })); }
  };
  // Handler para outros campos de texto
  const handleInputChange = (field: keyof Omit<ProdutoFormData, 'produto_nome' | 'categoriaId' | 'marcaId' | 'tipoId'>, value: string) => {
       console.log(`handleInputChange -> Campo: ${field}, Valor: "${value}"`);
       // Tenta atualização direta (sem ser funcional)
       const newState = { ...formData, [field]: value };
       setFormData(newState);
       console.log('Novo estado formData (parcial):', newState);
       if (errors[field]) { setErrors(prev => ({ ...prev, [field]: undefined })); }
  };
   // Handler para Pickers (usa undefined)
  const handlePickerChange = (field: 'categoriaId' | 'marcaId' | 'tipoId', itemValue: any) => {
       const numericValue = itemValue === null || itemValue === undefined || itemValue === "" ? undefined : Number(itemValue);
       console.log(`handlePickerChange -> Campo: ${field}, Valor Numérico:`, numericValue);
       setFormData(prev => ({ ...prev, [field]: numericValue }));
       if (errors[field]) { setErrors(prev => ({ ...prev, [field]: undefined })); }
  };

  // --- Validação ---
  const validarCampos = (): boolean => {
    console.log('[validarCampos] Iniciando validação...');
    const newErrors: Partial<Record<keyof ProdutoFormData | 'produto_nome', string>> = {};
    // Usa nomeInput para validar nome
    if (!nomeInput.trim()) newErrors.produto_nome = 'Nome é obrigatório';
    else if (nomeInput.trim().length < 3) newErrors.produto_nome = 'Nome deve ter pelo menos 3 caracteres';
    // Validações do formData
    if (!formData.produto_medida.trim()) newErrors.produto_medida = 'Medida é obrigatória';
    if (!formData.produto_precoOriginal.trim()) { newErrors.produto_precoOriginal = 'Preço é obrigatório'; }
    else if (isNaN(Number(formData.produto_precoOriginal)) || Number(formData.produto_precoOriginal) <= 0) { newErrors.produto_precoOriginal = 'Preço inválido'; }
    if (formData.categoriaId === undefined) newErrors.categoriaId = 'Selecione a Categoria'; // Checa undefined
    if (formData.marcaId === undefined) newErrors.marcaId = 'Selecione a Marca';
    if (formData.tipoId === undefined) newErrors.tipoId = 'Selecione o Tipo';

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('[validarCampos] Resultado:', isValid, 'Erros:', newErrors);
    return isValid;
   };

  // --- Submit ---
  const handleSubmit = async () => {
    console.log('[handleSubmit] Botão pressionado.');
    Keyboard.dismiss();
    const isValid = validarCampos(); // Chama a validação
    console.log('[handleSubmit] Resultado da validação:', isValid);
    if (!isValid) {
      Alert.alert("Erro de Validação", "Por favor, corrija os campos indicados.");
      return;
    }
    console.log('[handleSubmit] Validação OK. Iniciando submit...');
    setLoadingSubmit(true);
    setErrors({});

    const payload = {
      produto_nome: nomeInput.trim(), // Usa nomeInput
      produto_medida: formData.produto_medida.trim(),
      produto_precoOriginal: Number(formData.produto_precoOriginal),
      descricao: formData.descricao.trim() || null,
      CATEGORIA_PRODUTO_categoria_id: Number(formData.categoriaId),
      MARCA_PRODUTO_marca_id: Number(formData.marcaId),
      TIPO_PRODUTO_tipo_id: Number(formData.tipoId),
    };
    console.log('[handleSubmit] Payload:', payload);

    try {
        console.log('[handleSubmit] Chamando API...');
      if (isEditing) { await produtoService.atualizarProduto(produtoParaEditarId!, payload); Alert.alert('Sucesso', 'Produto atualizado!'); }
      else { await produtoService.criarProduto(payload as any); Alert.alert('Sucesso', 'Produto criado!'); }
      console.log('[handleSubmit] API Sucesso. Navegando de volta...');
      navigation.goBack();
    } catch (err: any) {
         console.error("[handleSubmit] Erro ao salvar produto:", err); // Log do erro
         const defaultMessage = isEditing ? "Não atualizar." : "Não criar.";
         const message = err.response?.data?.message || err.message || defaultMessage;
         if (err.response?.status === 409) { Alert.alert("Conflito", message); }
         else if (err.response?.status === 400) { Alert.alert("Dados Inválidos", message); }
         else { Alert.alert("Erro", message); }
    } finally {
        console.log('[handleSubmit] Finalizando submit.');
        setLoadingSubmit(false);
    }
   };

  // --- Render Picker ---
  const renderPicker = ( label: string, fieldName: 'categoriaId' | 'marcaId' | 'tipoId', selectedValue: number | undefined, items: any[], itemKeyProp: string, itemLabelProp: string ) => {
       console.log(`[renderPicker] ${label}: ${items?.length} itens, Sel: ${selectedValue}`);
       const validItems = Array.isArray(items) ? items : [];
       return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}:</Text>
            <View style={[ styles.pickerContainer, errors[fieldName] ? styles.inputError : null ]}>
                <Picker
                    selectedValue={selectedValue}
                    onValueChange={(itemValue) => handlePickerChange(fieldName, itemValue)}
                    style={styles.picker} prompt={`Selecione ${label}`} enabled={!loadingData}
                >
                    {/* Usar undefined para placeholder value */}
                    <Picker.Item label={`-- Selecione ${label} --`} value={undefined} style={styles.pickerPlaceholder}/>
                    {validItems.map((item) => {
                         // console.log(`  > Item ${label}: key=${item[itemKeyProp]}, label=${item[itemLabelProp]}, value=${item[itemKeyProp]}`); // Log Item (descomentar se necessário)
                        return (<Picker.Item key={item[itemKeyProp]} label={item[itemLabelProp]} value={item[itemKeyProp]} />);
                    })}
                </Picker>
            </View>
            {errors[fieldName] && <Text style={styles.errorText}>{errors[fieldName]}</Text>}
         </View>
     );
    };

  // --- Render Principal ---
  if (loadingData && isEditing) { return <ActivityIndicator size="large" color="#0066cc" style={styles.centered}/>; }
  if (errors.form) { return <Text style={[styles.centered, styles.errorText]}>{errors.form}</Text>; }

  // Pré-renderiza a seção de pickers
  const pickerSection = loadingData ? (
      <ActivityIndicator size="small" color="#0066cc" style={{ marginVertical: 10 }}/>
  ) : (
      <>
          {renderPicker('Categoria', 'categoriaId', formData.categoriaId, categorias, 'categoria_id', 'categoria_nome')}
          {renderPicker('Marca', 'marcaId', formData.marcaId, marcas, 'marca_id', 'marca_nome')}
          {renderPicker('Tipo', 'tipoId', formData.tipoId, tipos, 'tipo_id', 'tipo_nome')}
      </>
  );

  return (
     <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* View principal sem flex: 1 */}
        <View style={styles.container}>
            {/* Input de Nome (estado separado) */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome do Produto:</Text>
                <TextInput
                    style={[styles.input, errors.produto_nome ? styles.inputError : null]}
                    value={nomeInput} // Usa estado separado
                    onChangeText={handleNomeChange} // Usa handler separado
                    placeholder="Nome do Produto"
                    placeholderTextColor="grey"
                    maxLength={255}/>
                {errors.produto_nome && <Text style={styles.errorText}>{errors.produto_nome}</Text>}
            </View>
             {/* Outros Inputs */}
            <View style={styles.inputGroup}>
                 <Text style={styles.label}>Medida:</Text>
                 <TextInput style={[styles.input, errors.produto_medida ? styles.inputError : null]} value={formData.produto_medida} onChangeText={v => handleInputChange('produto_medida', v)} placeholder="Ex: Kg, Lt, Un" placeholderTextColor="grey" maxLength={45}/>
                 {errors.produto_medida && <Text style={styles.errorText}>{errors.produto_medida}</Text>}
             </View>
             <View style={styles.inputGroup}>
                 <Text style={styles.label}>Preço Original (R$):</Text>
                 <TextInput style={[styles.input, errors.produto_precoOriginal ? styles.inputError : null]} value={formData.produto_precoOriginal} onChangeText={v => handleInputChange('produto_precoOriginal', v.replace(/[^0-9.]/g, ''))} placeholder="Ex: 10.99" placeholderTextColor="grey" keyboardType="numeric"/>
                 {errors.produto_precoOriginal && <Text style={styles.errorText}>{errors.produto_precoOriginal}</Text>}
             </View>
              <View style={styles.inputGroup}>
                 <Text style={styles.label}>Descrição:</Text>
                 <TextInput style={[styles.input, styles.textArea, errors.descricao ? styles.inputError : null]} value={formData.descricao} onChangeText={v => handleInputChange('descricao', v)} placeholder="(Opcional)" placeholderTextColor="grey" multiline maxLength={500}/>
                 {errors.descricao && <Text style={styles.errorText}>{errors.descricao}</Text>}
              </View>

             {/* Renderiza a seção de pickers */}
             {pickerSection}

             {/* Conteúdo extra para teste de scroll */}
             {/* Adicione vários <Text> aqui se precisar forçar o scroll */}
             {/* <Text style={{marginVertical: 50}}>Espaço para Scroll</Text> */}
             {/* <Text style={{marginVertical: 50}}>Espaço para Scroll</Text> */}

            {/* Botão Salvar */}
            <TouchableOpacity
                style={[styles.button, styles.saveButton, (loadingSubmit || loadingData) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loadingSubmit || loadingData}
            >
                {loadingSubmit ? (<ActivityIndicator size="small" color="#fff" />) : (<Text style={styles.buttonText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}</Text>)}
            </TouchableOpacity>
        </View>
     </ScrollView>
  );
};

// Estilos (Mantendo correção do scroll)
const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1, paddingBottom: 40 },
    container: { padding: 20, backgroundColor: '#fff' }, // Sem flex: 1
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 16, marginBottom: 5, color: '#333', fontWeight: '500' },
    inputGroup: { marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 10, paddingHorizontal: 15, marginBottom: 3, borderRadius: 5, fontSize: 16, backgroundColor: '#f9f9f9' },
    textArea: { height: 100, textAlignVertical: 'top' },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 3, backgroundColor: '#f9f9f9' },
    picker: { height: 50 },
    pickerPlaceholder: { color: 'grey' },
    inputError: { borderColor: 'red' },
    errorText: { color: 'red', fontSize: 12, marginBottom: 8 },
    button: { padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
    saveButton: { backgroundColor: '#0066cc' },
    buttonDisabled: { backgroundColor: '#a7c7e7' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default ProductFormScreen;