// src/screens/Auth/CadastroScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Keyboard, ScrollView, Image, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import pessoaService from '../../services/pessoaService';
import locationService from '../../services/locationService';
import { Ionicons } from '@expo/vector-icons';

// --- Tipos ---
type PessoaTipo = 'Fisica' | 'Juridica' | 'Admin' | '';
interface CadastroFormData {
    pessoa_nome: string;
    pessoa_email: string;
    pessoa_telefone: string;
    pessoa_tipo: PessoaTipo;
    pessoa_login: string;
    pessoa_senha: string;
    confirmar_senha: string;
    cep: string;
    rua: string;
    bairro: string;
    numero: string;
    complemento: string;
    cidade: string;
    estado: string;
    CIDADE_cidade_id: number | null;
    pessoa_cpf: string;
    cnpj: string;
    fornecedor_num: string;
}

// --- Funções Auxiliares de Formatação (Fora do Componente) ---
const formatCPF = (value: string): string => { value = value.replace(/\D/g, '').slice(0, 11); if (value.length <= 3) return value; if (value.length <= 6) return value.replace(/(\d{3})(\d{1,})/, '$1.$2'); if (value.length <= 9) return value.replace(/(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3'); return value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3-$4'); };
const formatCNPJ = (value: string): string => { value = value.replace(/\D/g, '').slice(0, 14); if (value.length <= 2) return value; if (value.length <= 5) return value.replace(/(\d{2})(\d{1,})/, '$1.$2'); if (value.length <= 8) return value.replace(/(\d{2})(\d{3})(\d{1,})/, '$1.$2.$3'); if (value.length <= 12) return value.replace(/(\d{2})(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3/$4'); return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,})/, '$1.$2.$3/$4-$5'); };
const formatTelefone = (value: string): string => { const c=value.replace(/\D/g, '').slice(0,11);let f=c;if(c.length>2){f=`(${c.substring(0,2)}) ${c.substring(2)}`}if(c.length>6){f=`(${c.substring(0,2)}) ${c.substring(2,c.length>10?7:6)}-${c.substring(c.length>10?7:6)}`}if(c.length>10){f=`(${c.substring(0,2)}) ${c.substring(2,7)}-${c.substring(7,11)}`}else if(c.length>6){f=`(${c.substring(0,2)}) ${c.substring(2,6)}-${c.substring(6,10)}`}return f;};
const formatCEP = (value: string): string => { const cleaned = value.replace(/\D/g, '').slice(0, 8); if (cleaned.length > 5) return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`; return cleaned; };


// --- Componente Principal ---
const CadastroScreen = () => {
  console.log('--- CadastroScreen RENDER ---');
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // --- Estados ---
  const [formData, setFormData] = useState<CadastroFormData>({
    pessoa_nome: '', pessoa_email: '', pessoa_telefone: '', pessoa_tipo: '',
    pessoa_login: '', pessoa_senha: '', confirmar_senha: '', cep: '', rua: '',
    bairro: '', numero: '', complemento: '', cidade: '', estado: '',
    CIDADE_cidade_id: null, pessoa_cpf: '', cnpj: '', fornecedor_num: '',
  });
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [documentoUri, setDocumentoUri] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CadastroFormData | 'form' | 'selfie' | 'documento', string>>>({});

  // --- Permissões ---
  useEffect(() => {
     (async () => {
      if (Platform.OS !== 'web') {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          Alert.alert('Permissão Negada', 'Acesso à câmera é necessário.');
        }
      }
    })();
   }, []);

  // --- Handlers ---
  const handleInputChange = useCallback((field: keyof CadastroFormData, value: string | PessoaTipo) => {
    let formattedValue: any = value;
    if (typeof value === 'string') { // Aplica formatação apenas se for string
        if (field === 'pessoa_cpf') formattedValue = formatCPF(value);
        else if (field === 'cnpj') formattedValue = formatCNPJ(value);
        else if (field === 'pessoa_telefone') formattedValue = formatTelefone(value);
        else if (field === 'cep') formattedValue = formatCEP(value);
        else if (field === 'pessoa_email') formattedValue = value.toLowerCase().trim();
        else if (field === 'pessoa_login' && formData.pessoa_tipo === 'Admin') formattedValue = value.replace(/\D/g, '');
        else if (field === 'fornecedor_num') formattedValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) { setErrors(prev => { const n = {...prev}; delete n[field]; return n; }); }
  }, [errors, formData.pessoa_tipo]); // Dependência de pessoa_tipo é importante aqui


   const handleCepBlur = useCallback(async () => {
        const cep = formData.cep?.replace(/\D/g, '');
        if (!cep || cep.length !== 8) { setFormData(prev => ({ ...prev, rua: '', bairro: '', cidade: '', estado: '', CIDADE_cidade_id: null })); return; }
        Keyboard.dismiss(); setLoadingCep(true); setErrors(prev => ({ ...prev, cep: undefined, rua: undefined, bairro: undefined, cidade: undefined, estado: undefined })); // Limpa erros relacionados
        try {
            const response = await locationService.lookupCep(cep); const address = response.data;
            setFormData(prev => ({ ...prev, rua: address.logradouro || '', bairro: address.bairro || '', cidade: address.cidade || '', estado: address.estado || '', CIDADE_cidade_id: address.cidadeId || null, }));
        } catch (error: any) { const msg = error.response?.data?.message || error.message || "CEP não encontrado."; setErrors(prev => ({ ...prev, cep: msg })); setFormData(prev => ({ ...prev, rua: '', bairro: '', cidade: '', estado: '', CIDADE_cidade_id: null }));
        } finally { setLoadingCep(false); }
   }, [formData.cep]); // Depende apenas do cep

   const handlePickImage = useCallback(async (type: 'selfie' | 'documento') => {
       try { let result = await ImagePicker.launchCameraAsync({ quality: 0.7, });
           if (!result.canceled && result.assets && result.assets.length > 0) { const uri = result.assets[0].uri; if (type === 'selfie') { setSelfieUri(uri); if (errors.selfie) setErrors(prev => ({ ...prev, selfie: undefined })); } else { setDocumentoUri(uri); if (errors.documento) setErrors(prev => ({ ...prev, documento: undefined })); } Alert.alert('Foto Capturada'); }
       } catch (error) { console.error("Erro capturar imagem:", error); Alert.alert('Erro', 'Não foi possível usar a câmera.'); }
   }, [errors.selfie, errors.documento]);

  // --- Validação Final ---
  const validarFormularioCompleto = useCallback((): boolean => {
    console.log('[validarFormularioCompleto] Iniciando...');
    const newErrors: Partial<Record<keyof CadastroFormData | 'form' | 'selfie' | 'documento', string>> = {};
    // ... Lógica de validação completa como antes ...
    if (!formData.pessoa_nome?.trim()) newErrors.pessoa_nome = 'Nome obrigatório';
    // ... etc ...
    if (formData.pessoa_tipo === 'Fisica' && !selfieUri) newErrors.selfie = 'Selfie obrigatória';
    if (formData.pessoa_tipo === 'Fisica' && !documentoUri) newErrors.documento = 'Foto doc. obrigatória'; // Corrigido nome do erro
    // ... validação CPF/CNPJ/Login/Endereço ...

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('[validarFormularioCompleto] Resultado:', isValid, 'Erros:', newErrors);
    return isValid; // <<< return boolean >>>
   }, [formData, selfieUri, documentoUri]);


  // --- Submissão Final ---
  const handleFinalizarCadastro = useCallback(async () => {
    console.log('[handleSubmit] Botão pressionado.');
    Keyboard.dismiss();
    if (!validarFormularioCompleto()) { console.log('[handleSubmit] Falha validação.'); Alert.alert("Erro", "Verifique os campos."); return; }
    console.log('[handleSubmit] Validação OK.'); setLoadingSubmit(true); setErrors({});
    let pessoaCriadaId: number | null = null;
    const payloadRegistro: any = {
        pessoa_nome: formData.pessoa_nome, pessoa_email: formData.pessoa_email,
        pessoa_telefone: formData.pessoa_telefone?.replace(/\D/g, '') || null,
        pessoa_tipo: formData.pessoa_tipo, pessoa_login: formData.pessoa_login,
        pessoa_senha: formData.pessoa_senha,
        cep: formData.cep?.replace(/\D/g, ''), rua: formData.rua, bairro: formData.bairro,
        numero: formData.numero, complemento: formData.complemento || null,
        CIDADE_cidade_id: formData.CIDADE_cidade_id,
    };
     if (formData.pessoa_tipo === 'Fisica') { payloadRegistro.pessoa_cpf = formData.pessoa_cpf?.replace(/\D/g, ''); }
     else if (formData.pessoa_tipo === 'Juridica') { payloadRegistro.cnpj = formData.cnpj?.replace(/\D/g, ''); payloadRegistro.fornecedor_num = formData.fornecedor_num ? Number(formData.fornecedor_num) : null; }
    console.log('[handleSubmit] Payload Registro:', payloadRegistro);
    try {
        const pessoaCriada = await pessoaService.registrar(payloadRegistro); pessoaCriadaId = pessoaCriada?.pessoa_id;
        if (!pessoaCriadaId) throw new Error("ID não retornado.");
        console.log(`[handleSubmit] Pessoa registrada ID: ${pessoaCriadaId}`);
        if (formData.pessoa_tipo === 'Fisica') {
            let uploadsOk = true;
            if (selfieUri) { try { await pessoaService.uploadFoto(pessoaCriadaId, 'selfie', selfieUri); } catch (e) { uploadsOk = false; console.error("Erro selfie", e); Alert.alert("Erro", "Falha upload selfie.");}}
            if (documentoUri) { try { await pessoaService.uploadFoto(pessoaCriadaId, 'documento', documentoUri); } catch (e) { uploadsOk = false; console.error("Erro doc", e); Alert.alert("Erro", "Falha upload documento.");}}
             if (!uploadsOk) console.warn("Cadastro realizado, mas uploads falharam.");
        }
        Alert.alert("Sucesso!", "Cadastro realizado."); navigation.navigate('Login');
    } catch (err: any) { console.error("Erro finalizar cadastro:", err); Alert.alert("Erro", "Não foi possível cadastrar."); }
    finally { setLoadingSubmit(false); }
   }, [formData, selfieUri, documentoUri, validarFormularioCompleto, navigation]); // Adiciona dependências


   // --- Render Picker (Tipo Pessoa) ---
   // Mantido DENTRO pois usa state/handlers
   function renderTipoPicker() {
       // Garante que o retorno seja JSX ou null
       return (
           <View style={styles.inputGroup}>
               <Text style={styles.label}>Tipo de Conta:</Text>
               <View style={[ styles.pickerContainer, errors.pessoa_tipo ? styles.inputError : null ]}>
                   <Picker
                       selectedValue={formData.pessoa_tipo}
                       onValueChange={(itemValue: PessoaTipo) => { handleInputChange('pessoa_tipo', itemValue || ''); }} // Passa tipo correto
                       style={styles.picker} prompt="Selecione o Tipo de Conta"
                   >
                       <Picker.Item label="-- Selecione --" value="" style={styles.pickerPlaceholder}/>
                       <Picker.Item label="Pessoa Física (CPF)" value="Fisica" />
                       <Picker.Item label="Pessoa Jurídica (CNPJ)" value="Juridica" />
                   </Picker>
               </View>
               {errors.pessoa_tipo && <Text style={styles.errorText}>{errors.pessoa_tipo}</Text>}
            </View>
        );
   } // <<< Fim da função renderTipoPicker

  // --- Renderização Principal ---
  if (errors.form) { return <Text style={[styles.centered, styles.errorText]}>{errors.form}</Text>; }

  return (
     <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
            <Text style={styles.title}>Criar Conta</Text>

            {/* Dados Pessoais */}
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
             <View style={styles.inputGroup}><Text style={styles.label}>Nome:</Text><TextInput style={[styles.input, errors.pessoa_nome && styles.inputError]} value={formData.pessoa_nome} onChangeText={v => handleInputChange('pessoa_nome', v)} placeholder="Nome completo" autoCapitalize="words"/>{errors.pessoa_nome && <Text style={styles.errorText}>{errors.pessoa_nome}</Text>}</View>
             <View style={styles.inputGroup}><Text style={styles.label}>Email:</Text><TextInput style={[styles.input, errors.pessoa_email && styles.inputError]} value={formData.pessoa_email} onChangeText={v => handleInputChange('pessoa_email', v)} placeholder="seuemail@exemplo.com" keyboardType="email-address" autoCapitalize="none"/>{errors.pessoa_email && <Text style={styles.errorText}>{errors.pessoa_email}</Text>}</View>
             <View style={styles.inputGroup}><Text style={styles.label}>Telefone:</Text><TextInput style={[styles.input, errors.pessoa_telefone && styles.inputError]} value={formData.pessoa_telefone} onChangeText={v => handleInputChange('pessoa_telefone', v)} placeholder="(XX) XXXXX-XXXX" keyboardType="phone-pad" maxLength={15}/>{errors.pessoa_telefone && <Text style={styles.errorText}>{errors.pessoa_telefone}</Text>}</View>
             <View style={styles.inputGroup}><Text style={styles.label}>Senha:</Text><TextInput style={[styles.input, errors.pessoa_senha && styles.inputError]} value={formData.pessoa_senha} onChangeText={v => handleInputChange('pessoa_senha', v)} placeholder="Mínimo 3 caracteres" secureTextEntry/>{errors.pessoa_senha && <Text style={styles.errorText}>{errors.pessoa_senha}</Text>}</View>
             <View style={styles.inputGroup}><Text style={styles.label}>Confirmar Senha:</Text><TextInput style={[styles.input, errors.confirmar_senha && styles.inputError]} value={formData.confirmar_senha} onChangeText={v => handleInputChange('confirmar_senha', v)} placeholder="Repita a senha" secureTextEntry/>{errors.confirmar_senha && <Text style={styles.errorText}>{errors.confirmar_senha}</Text>}</View>

            {/* Tipo e Documento */}
            <Text style={styles.sectionTitle}>Tipo e Documento</Text>
            {renderTipoPicker()}
            {/* Renderização Condicional com Ternário */}
            {formData.pessoa_tipo === 'Fisica' ? (
                 <View style={styles.inputGroup}>
                    <Text style={styles.label}>CPF:</Text>
                    <TextInput style={[styles.input, errors.pessoa_cpf && styles.inputError]} value={formData.pessoa_cpf} onChangeText={v => handleInputChange('pessoa_cpf', v)} placeholder="000.000.000-00" keyboardType="numeric" maxLength={14}/>
                    {errors.pessoa_cpf && <Text style={styles.errorText}>{errors.pessoa_cpf}</Text>}
                </View>
            ) : null}
            {formData.pessoa_tipo === 'Juridica' ? (
                 <>
                     <View style={styles.inputGroup}>
                        <Text style={styles.label}>CNPJ:</Text>
                        <TextInput style={[styles.input, errors.cnpj && styles.inputError]} value={formData.cnpj} onChangeText={v => handleInputChange('cnpj', v)} placeholder="00.000.000/0000-00" keyboardType="numeric" maxLength={18}/>
                        {errors.cnpj && <Text style={styles.errorText}>{errors.cnpj}</Text>}
                    </View>
                     <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nº Fornecedor (Opc.):</Text>
                        <TextInput style={[styles.input, errors.fornecedor_num && styles.inputError]} value={formData.fornecedor_num} onChangeText={v => handleInputChange('fornecedor_num', v.replace(/\D/g, ''))} keyboardType="numeric"/>
                        {errors.fornecedor_num && <Text style={styles.errorText}>{errors.fornecedor_num}</Text>}
                    </View>
                 </>
            ) : null}
             {/* Removido Admin daqui, pois Login Admin é o campo 'pessoa_login' */}
              {(formData.pessoa_tipo === 'Admin') ? (
                  <View style={styles.inputGroup}>
                     <Text style={styles.label}>Login Admin:</Text>
                     <TextInput style={[styles.input, errors.pessoa_login && styles.inputError]} value={formData.pessoa_login} onChangeText={v => handleInputChange('pessoa_login', v)} placeholder="1 a 999" keyboardType="numeric" maxLength={3}/>
                     {errors.pessoa_login && <Text style={styles.errorText}>{errors.pessoa_login}</Text>}
                 </View>
              ) : null }


            {/* Endereço */}
            <Text style={styles.sectionTitle}>Endereço</Text>
             <View style={styles.inputGroup}><Text style={styles.label}>CEP:</Text><TextInput style={[styles.input, errors.cep && styles.inputError]} value={formData.cep} onChangeText={v => handleInputChange('cep', v)} maxLength={9} keyboardType="numeric" onBlur={handleCepBlur} placeholder="00000-000" placeholderTextColor="grey"/>{loadingCep && <ActivityIndicator size="small" color="#0066cc" />}{errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}</View>
             <View style={styles.inputGroup}><Text style={styles.label}>Rua:</Text><TextInput style={[styles.input, styles.inputDisabled, errors.rua && styles.inputError]} value={formData.rua} editable={false} placeholder="Preenchido pelo CEP" placeholderTextColor="grey"/>{errors.rua && <Text style={styles.errorText}>{errors.rua}</Text>}</View>
             <View style={styles.inputGroup}><Text style={styles.label}>Bairro:</Text><TextInput style={[styles.input, styles.inputDisabled]} value={formData.bairro} editable={false} placeholder="Preenchido pelo CEP" placeholderTextColor="grey"/></View>
             <View style={styles.inputGroup}><Text style={styles.label}>Número:</Text><TextInput style={[styles.input, errors.numero && styles.inputError]} value={formData.numero} onChangeText={v => handleInputChange('numero', v)} placeholder="Número ou S/N" placeholderTextColor="grey"/>{errors.numero && <Text style={styles.errorText}>{errors.numero}</Text>}</View>
             <View style={styles.inputGroup}><Text style={styles.label}>Cidade:</Text><TextInput style={[styles.input, styles.inputDisabled]} value={formData.cidade} editable={false} placeholder="Preenchido pelo CEP" placeholderTextColor="grey"/></View>
             <View style={styles.inputGroup}><Text style={styles.label}>Estado (UF):</Text><TextInput style={[styles.input, styles.inputDisabled]} value={formData.estado} editable={false} placeholder="Preenchido pelo CEP" placeholderTextColor="grey"/></View>
             <View style={styles.inputGroup}><Text style={styles.label}>Complemento:</Text><TextInput style={[styles.input, errors.complemento && styles.inputError]} value={formData.complemento} onChangeText={v => handleInputChange('complemento', v)} placeholder="(Opcional)" placeholderTextColor="grey"/>{errors.complemento && <Text style={styles.errorText}>{errors.complemento}</Text>}</View>


              {/* Upload de Fotos (Apenas Pessoa Física) */}
              {formData.pessoa_tipo === 'Fisica' ? (
                  <>
                    <Text style={styles.sectionTitle}>Validação de Identidade</Text>
                    <View style={styles.photoSection}>
                         <View style={styles.photoPreviewContainer}>{selfieUri ? <Image source={{ uri: selfieUri }} style={styles.imagePreview} /> : <View style={styles.imagePlaceholder}><Ionicons name="person-outline" size={40} color="grey"/></View>}<TouchableOpacity style={[styles.imagePickerButton, loadingSubmit && styles.buttonDisabled]} onPress={() => handlePickImage('selfie')} disabled={loadingSubmit}><Ionicons name="camera-outline" size={20} color="white"/><Text style={styles.imagePickerButtonText}>Enviar Selfie</Text></TouchableOpacity>{errors.selfie && <Text style={styles.errorText}>{errors.selfie}</Text>}</View>
                         <View style={styles.photoPreviewContainer}>{documentoUri ? <Image source={{ uri: documentoUri }} style={styles.imagePreview} /> : <View style={styles.imagePlaceholder}><Ionicons name="document-text-outline" size={40} color="grey"/></View>}<TouchableOpacity style={[styles.imagePickerButton, loadingSubmit && styles.buttonDisabled]} onPress={() => handlePickImage('documento')} disabled={loadingSubmit}><Ionicons name="camera-outline" size={20} color="white"/><Text style={styles.imagePickerButtonText}>Foto Documento</Text></TouchableOpacity>{errors.documento && <Text style={styles.errorText}>{errors.documento}</Text>}</View>
                    </View>
                   </>
              ) : null}

            {/* Botão Finalizar */}
            <TouchableOpacity
                style={[styles.button, styles.finalizarButton, (loadingSubmit || loadingData) && styles.buttonDisabled]}
                onPress={handleFinalizarCadastro}
                disabled={loadingSubmit || loadingData}
            >
                {loadingSubmit ? (<ActivityIndicator size="small" color="#fff" />) : (<Text style={styles.buttonText}>Finalizar Cadastro</Text>)}
            </TouchableOpacity>
        </View>
     </ScrollView>
  );
};

// --- Estilos (Definição COMPLETA E CORRETA) ---
// <<< COPIAR O StyleSheet.create({...}) COMPLETO DA RESPOSTA #79 AQUI >>>
const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1, paddingBottom: 40 },
    container: { padding: 20, backgroundColor: '#f0f0f0' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: '#333' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 15, color: '#444', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 5 },
    inputGroup: { marginBottom: 12 },
    label: { fontSize: 14, marginBottom: 6, color: '#555', fontWeight: '500'},
    input: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 10, paddingHorizontal: 15, marginBottom: 3, borderRadius: 8, fontSize: 16, backgroundColor: 'white' },
    inputError: { borderColor: 'red' },
    inputDisabled: { backgroundColor: '#e9ecef', color: '#6c757d' },
    errorText: { color: 'red', fontSize: 12, marginTop: 2, marginBottom: 5 },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 3, backgroundColor: 'white' },
    picker: { height: 50, marginTop: Platform.OS === 'ios' ? -10 : 0 },
    pickerPlaceholder: { color: '#a1a1a1' },
    textArea: { height: 100, textAlignVertical: 'top' },
    photoSection: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', marginVertical: 15 },
    photoPreviewContainer: { alignItems: 'center', maxWidth: '45%' },
    imagePlaceholder: { width: 100, height: 100, borderRadius: 5, backgroundColor: '#e9ecef', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
    imagePreview: { width: 100, height: 100, borderRadius: 5, marginBottom: 10, resizeMode: 'cover', borderWidth: 1, borderColor: '#ccc' },
    imagePickerButton: { flexDirection: 'row', backgroundColor: '#5bc0de', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, alignItems: 'center' },
    imagePickerButtonText: { color: 'white', marginLeft: 5, fontSize: 13 },
    button: { paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 25 },
    finalizarButton: { backgroundColor: '#0066cc' },
    buttonDisabled: { backgroundColor: '#a7c7e7' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});


export default CadastroScreen;