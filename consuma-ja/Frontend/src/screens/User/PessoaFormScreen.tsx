// src/screens/User/PessoaFormScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
// <<< Adicionar StyleSheet >>>
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Keyboard, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import pessoaService from '../../services/pessoaService';
import type { Pessoa, PessoaStatus } from '../../../../Backend/pessoa-service/src/domain/entities/pessoa.entity'; // Importar tipos completos de Pessoa

// Função de formatação (definida fora ou importada)
const formatTelefone = (value: string): string => { const c=value.replace(/\D/g, '').slice(0,11);let f=c;if(c.length>2){f=`(${c.substring(0,2)}) ${c.substring(2)}`}if(c.length>6){f=`(${c.substring(0,2)}) ${c.substring(2,c.length>10?7:6)}-${c.substring(c.length>10?7:6)}`}if(c.length>10){f=`(${c.substring(0,2)}) ${c.substring(2,7)}-${c.substring(7,11)}`}else if(c.length>6){f=`(${c.substring(0,2)}) ${c.substring(2,6)}-${c.substring(6,10)}`}return f;};


const PessoaFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const pessoaId = route.params?.pessoaId; // ID vem da lista para edição

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [status, setStatus] = useState<PessoaStatus>(1); // 1 = Ativo, 0 = Inativo

  // Estados de controle
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string, email?: string, telefone?: string, status?: string, form?: string }>({});
  const [pessoaOriginal, setPessoaOriginal] = useState<Pessoa | null>(null);

  // Busca dados da pessoa ao carregar
  useEffect(() => {
    let isMounted = true;
    const fetchPessoa = async () => {
      if (!pessoaId) { Alert.alert("Erro", "ID não fornecido."); navigation.goBack(); return; }
      setLoadingData(true); setErrors({});
      try {
        const data = await pessoaService.buscarPessoaPorId(pessoaId);
        if (isMounted) {
            if (data) {
                setPessoaOriginal(data);
                setNome(data.pessoa_nome || '');
                setEmail(data.pessoa_email || '');
                setTelefone(formatTelefone(data.pessoa_telefone || ''));
                setStatus(data.pessoa_status ?? 1);
                navigation.setOptions({ title: `Editar: ${data.pessoa_nome.split(' ')[0]}` }); // Título mais curto
            } else { throw new Error("Pessoa não encontrada."); }
        }
      } catch (error: any) {
         console.error("Erro ao buscar pessoa:", error);
         if(isMounted) setErrors({ form: "Erro ao carregar dados."});
      } finally {
         if(isMounted) setLoadingData(false);
      }
    };
    fetchPessoa();
    return () => { isMounted = false };
  }, [pessoaId, navigation]);

  // Validação
   const validarCampos = (): boolean => {
        const newErrors: { nome?: string, email?: string, telefone?: string, status?: string } = {};
        if (!nome.trim()) newErrors.nome = 'Nome obrigatório';
        if (!email.includes('@')) newErrors.email = 'Email inválido';
        if (!telefone || telefone.replace(/\D/g, '').length < 10) newErrors.telefone = 'Telefone inválido';
        if (status !== 0 && status !== 1) newErrors.status = 'Status inválido.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
   };

  // Submit
  const handleSubmit = async () => {
        Keyboard.dismiss();
        if (!validarCampos()) { Alert.alert("Erro", "Verifique os campos."); return; }
        setLoadingSubmit(true); setErrors({});

        // Monta DTO apenas com campos permitidos para UpdatePessoaDto
        const payload: any = {
            pessoa_nome: nome.trim(),
            pessoa_email: email.trim().toLowerCase(),
            pessoa_telefone: telefone.replace(/\D/g, '') || null,
            pessoa_status: status,
        };

        try {
            await pessoaService.atualizarPessoa(pessoaId, payload);
            Alert.alert('Sucesso', 'Dados da pessoa atualizados!');
            navigation.goBack();
        } catch (err: any) {
            console.error("Erro ao atualizar pessoa:", err);
            const message = err.response?.data?.message || err.message || "Erro ao atualizar.";
            if (err.response?.status === 409) { Alert.alert("Conflito", message); }
            else { Alert.alert("Erro", message); }
        } finally { setLoadingSubmit(false); }
   };

  // --- Renderização ---
  if (loadingData) return <ActivityIndicator size="large" style={styles.centered}/>; // <<< USA styles.centered
  if (errors.form || !pessoaOriginal) return <Text style={[styles.centered, styles.errorText]}>{errors.form || "Não foi possível carregar."}</Text>; // <<< USA styles.centered, styles.errorText

  return (
     <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* <<< USA styles.container >>> */}
        <View style={styles.container}>
             {/* Campos Não Editáveis */}
             {/* <<< USA styles.inputGroup, styles.label, styles.input, styles.inputDisabled >>> */}
             <View style={styles.inputGroup}>
                 <Text style={styles.label}>ID:</Text>
                 <TextInput style={[styles.input, styles.inputDisabled]} value={pessoaOriginal.pessoa_id.toString()} editable={false}/>
             </View>
             <View style={styles.inputGroup}>
                 <Text style={styles.label}>Tipo:</Text>
                 <TextInput style={[styles.input, styles.inputDisabled]} value={pessoaOriginal.pessoa_tipo} editable={false}/>
             </View>
              <View style={styles.inputGroup}>
                 <Text style={styles.label}>Login (CPF/CNPJ/Admin ID):</Text>
                 <TextInput style={[styles.input, styles.inputDisabled]} value={pessoaOriginal.pessoa_login} editable={false}/>
             </View>

             {/* Campos Editáveis */}
              {/* <<< USA styles.inputGroup, styles.label, styles.input, styles.inputError, styles.errorText >>> */}
             <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome:</Text>
                <TextInput style={[styles.input, errors.nome ? styles.inputError : null]} value={nome} onChangeText={setNome} placeholder="Nome Completo" autoCapitalize="words"/>
                {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
             </View>
             <View style={styles.inputGroup}>
                <Text style={styles.label}>Email:</Text>
                <TextInput style={[styles.input, errors.email ? styles.inputError : null]} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none"/>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
             </View>
             <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefone:</Text>
                <TextInput style={[styles.input, errors.telefone ? styles.inputError : null]} value={telefone} onChangeText={(v) => setTelefone(formatTelefone(v))} placeholder="Telefone" keyboardType="phone-pad" maxLength={15}/>
                {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
             </View>

             {/* Seletor de Status (Ativo/Inativo) */}
              {/* <<< USA styles.inputGroup, styles.label, styles.pickerContainer, styles.inputError, styles.picker, styles.errorText >>> */}
              <View style={styles.inputGroup}>
                 <Text style={styles.label}>Status:</Text>
                 <View style={[ styles.pickerContainer, errors.status ? styles.inputError : null ]}>
                    <Picker selectedValue={status} onValueChange={(itemValue: PessoaStatus) => setStatus(itemValue)} style={styles.picker} prompt="Selecione o Status" >
                        <Picker.Item label="Ativo" value={1} />
                        <Picker.Item label="Inativo" value={0} />
                    </Picker>
                 </View>
                 {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}
             </View>

            {/* Botão Salvar */}
             {/* <<< USA styles.button, styles.saveButton, styles.buttonDisabled, styles.buttonText >>> */}
            <TouchableOpacity style={[styles.button, styles.saveButton, loadingSubmit && styles.buttonDisabled]} onPress={handleSubmit} disabled={loadingSubmit}>
                {loadingSubmit ? (<ActivityIndicator size="small" color="#fff" />) : (<Text style={styles.buttonText}>Salvar Alterações</Text>)}
            </TouchableOpacity>
        </View>
     </ScrollView>
  );
};

// --- Estilos (Definição COMPLETA E CORRETA) ---
// <<< DEFINIÇÃO COMPLETA DO StyleSheet >>>
const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1, paddingBottom: 40 },
    container: { padding: 20, backgroundColor: '#fff' }, // Fundo branco e sem flex
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }, // Definido
    label: { fontSize: 16, marginBottom: 5, color: '#333', fontWeight: '500' }, // Definido
    inputGroup: { marginBottom: 15 }, // Definido e com mais espaço
    input: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, fontSize: 16, backgroundColor: '#f9f9f9' }, // Definido
    inputError: { borderColor: 'red' }, // Definido
    inputDisabled: { backgroundColor: '#e9ecef', color: '#6c757d' }, // Definido
    errorText: { color: 'red', fontSize: 12, marginTop: 3 }, // Definido
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#f9f9f9' }, // Definido
    picker: { height: 50, marginTop: Platform.OS === 'ios' ? -10 : 0 }, // Definido
    pickerPlaceholder: { color: 'grey' }, // Definido
    button: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 25 }, // Definido
    saveButton: { backgroundColor: '#0066cc' }, // Definido (pode ser este ou 'finalizarButton')
    buttonDisabled: { backgroundColor: '#a7c7e7' }, // Definido
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }, // Definido
});
// ------------------------------------------

export default PessoaFormScreen;

// Função formatTelefone precisa estar definida ou importada
// const formatTelefone = (value: string): string => { /* ... */ };