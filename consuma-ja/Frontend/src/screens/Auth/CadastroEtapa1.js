import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Keyboard } from 'react-native';
import locationService from '../../services/locationService'; // Importar o serviço

// Componente reutilizável para Input (opcional, mas ajuda a limpar)
const FormInput = ({ label, value, onChangeText, error, keyboardType = 'default', maxLength, placeholder, secureTextEntry = false, editable = true }) => (
    <View style={styles.inputGroup}>
        {label && <Text style={styles.label}>{label}:</Text>}
        <TextInput
            style={[styles.input, error ? styles.inputError : null, !editable ? styles.inputDisabled : null]}
            placeholder={placeholder || label}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            maxLength={maxLength}
            secureTextEntry={secureTextEntry}
            editable={editable}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);


const CadastroEtapa1 = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    login: '',
    senha: '',
    // Endereço separado
    cep: '',
    logradouro: '',
    numero: '', // Usuário preenche o número
    complemento: '',
    bairro: '',
    cidade: '', // Será preenchido pela API
    estado: '', // Será preenchido pela API
  });
  // Guarda os IDs retornados pela API para enviar ao backend no final do cadastro
   const [locationIds, setLocationIds] = useState({ cidadeId: null, estadoId: null });

  const [errors, setErrors] = useState({});
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState(null);

  // --- Lógica da Busca de CEP ---
  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, ''); // Limpa CEP
    if (cep.length !== 8) {
      // Limpa campos se CEP for inválido após sair do campo
      setFormData(prev => ({
          ...prev,
          logradouro: '',
          bairro: '',
          cidade: '',
          estado: '',
       }));
      setLocationIds({ cidadeId: null, estadoId: null });
      setCepError(null); // Limpa erro anterior
      return; // Não busca se não tem 8 dígitos
    }

    Keyboard.dismiss(); // Esconde teclado
    setCepLoading(true);
    setCepError(null);
    setErrors(prev => ({ ...prev, cep: undefined })); // Limpa erro de formato do CEP

    try {
      const response = await locationService.lookupCep(cep);
      const address = response.data; // Supondo que axios retorna dados em .data

      // Atualiza o formulário com os dados da API
      setFormData(prev => ({
        ...prev,
        logradouro: address.logradouro || '',
        bairro: address.bairro || '',
        cidade: address.cidade || '',
        estado: address.estado || '', // Sigla UF
      }));
       // Guarda os IDs para o backend
       setLocationIds({ cidadeId: address.cidadeId, estadoId: address.estadoId });

    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
       const message = error.response?.data?.message || error.message || "CEP não encontrado ou erro na busca.";
      setCepError(message); // Mostra erro específico do CEP
       // Limpa campos se deu erro na busca
       setFormData(prev => ({
           ...prev,
           logradouro: '',
           bairro: '',
           cidade: '',
           estado: '',
       }));
       setLocationIds({ cidadeId: null, estadoId: null });
       // Poderia setar erro no campo CEP também:
       // setErrors(prev => ({ ...prev, cep: message }));

    } finally {
      setCepLoading(false);
    }
  };

  // --- Validação e Navegação ---
  const validarCampos = () => {
    let newErrors = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email.includes('@')) newErrors.email = 'E-mail inválido';
    if (!formData.telefone || formData.telefone.replace(/\D/g, '').length < 10) newErrors.telefone = 'Telefone inválido (mínimo 10 dígitos)';
    if (!formData.login) newErrors.login = 'Login é obrigatório';
    if (formData.senha.length < 6) newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
    if (!formData.cep.match(/^\d{5}-?\d{3}$/)) newErrors.cep = 'Formato de CEP inválido (use 00000-000 ou 00000000)';
     // Valida se o endereço foi preenchido (após busca CEP bem sucedida)
     if (formData.cep.length === 8 || formData.cep.length === 9) { // Só valida se CEP foi digitado
         if (!formData.logradouro && !cepLoading && !cepError) newErrors.logradouro = 'Endereço não encontrado para este CEP.'; // Avisa se busca não retornou rua
         if (!formData.numero) newErrors.numero = 'Número é obrigatório';
         if (!formData.cidade || !formData.estado || !locationIds.cidadeId) newErrors.cep = 'CEP inválido ou não encontrado na base.'; // Verifica se busca deu certo
     } else if (!formData.cep) {
         newErrors.cep = 'CEP é obrigatório'; // Se CEP está vazio
     }


    setErrors(newErrors);
    setCepError(null); // Limpa erro de CEP se validação geral for chamada
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validarCampos()) {
      // Monta o objeto final para enviar para a próxima etapa ou backend
       const dadosCompletos = {
           ...formData,
           cidade_id: locationIds.cidadeId, // Adiciona IDs
           estado_id: locationIds.estadoId, // Adiciona IDs
           // Remover cidade/estado (nomes) se backend só precisar dos IDs? Depende da sua API de usuário
       };
       // Remove os nomes textuais se backend só usa IDs
       // delete dadosCompletos.cidade;
       // delete dadosCompletos.estado;

       console.log("Dados para Etapa 2:", dadosCompletos); // Log para debug
      navigation.navigate('CadastroEtapa2', { formData: dadosCompletos });
    } else {
        Alert.alert("Erro de Validação", "Por favor, corrija os campos marcados.");
    }
  };

  // Formata CEP enquanto digita (opcional)
   const handleCepChange = (text) => {
       const cleaned = text.replace(/\D/g, '');
       let formatted = cleaned;
       if (cleaned.length > 5) {
           formatted = cleaned.substring(0, 5) + '-' + cleaned.substring(5, 8);
       }
       setFormData({ ...formData, cep: formatted });
   };

   // Formata telefone (opcional)
   const handleTelefoneChange = (text) => {
        const cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
        }
        if (cleaned.length > 6) {
            formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, cleaned.length > 10 ? 7 : 6)}-${cleaned.substring(cleaned.length > 10 ? 7 : 6)}`;
        }
        if (cleaned.length > 10) { // Celular (9xxxx-xxxx)
             formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
        } else if (cleaned.length > 6) { // Fixo (xxxx-xxxx)
            formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
        }

        setFormData({ ...formData, telefone: formatted });
   };


  return (
    // Usar ScrollView para caber em telas menores
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Cadastro - Etapa 1</Text>

        <FormInput label="Nome Completo" value={formData.nome} onChangeText={(text) => setFormData({ ...formData, nome: text })} error={errors.nome} />
        <FormInput label="E-mail" value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text.toLowerCase() })} error={errors.email} keyboardType="email-address" />
        <FormInput label="Telefone" value={formData.telefone} onChangeText={handleTelefoneChange} error={errors.telefone} keyboardType="phone-pad" maxLength={15} />
        <FormInput label="Login" value={formData.login} onChangeText={(text) => setFormData({ ...formData, login: text })} error={errors.login} />
        <FormInput label="Senha" value={formData.senha} onChangeText={(text) => setFormData({ ...formData, senha: text })} error={errors.senha} secureTextEntry={true} />

        <Text style={styles.sectionTitle}>Endereço</Text>

         <FormInput
            label="CEP"
            value={formData.cep}
            //onChangeText={(text) => setFormData({ ...formData, cep: text })}
             onChangeText={handleCepChange} // Usa formatação
            error={errors.cep || cepError} // Mostra erro de validação ou de busca
            keyboardType="numeric"
            maxLength={9} // Com hífen
            placeholder="00000-000"
            // Chama a busca quando o campo perde o foco (onBlur)
            onBlur={handleCepBlur}
        />
        {cepLoading && <ActivityIndicator size="small" color="#0066cc" style={styles.cepLoading}/>}

         {/* Campos preenchidos pela API CEP - não editáveis */}
         <FormInput label="Logradouro" value={formData.logradouro} error={errors.logradouro} editable={false} />
         <FormInput label="Bairro" value={formData.bairro} editable={false} />
         <FormInput label="Cidade" value={formData.cidade} editable={false} />
         <FormInput label="Estado (UF)" value={formData.estado} editable={false} />

         {/* Campos que o usuário preenche */}
         <FormInput label="Número" value={formData.numero} onChangeText={(text) => setFormData({ ...formData, numero: text.replace(/\D/g, '') })} error={errors.numero} keyboardType="numeric" />
         <FormInput label="Complemento" value={formData.complemento} onChangeText={(text) => setFormData({ ...formData, complemento: text })} error={errors.complemento} placeholder="(Opcional) Bloco, Apto, etc."/>


        <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={cepLoading}>
          <Text style={styles.buttonText}>Próximo</Text>
        </TouchableOpacity>
      </View>
     </ScrollView>
  );
};

// --- Estilos --- (Adapte conforme necessário)
const styles = StyleSheet.create({
   scrollContainer: { flexGrow: 1 }, // Permite scroll
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
   inputGroup: { marginBottom: 10, }, // Agrupa label e input
   label: { fontSize: 14, marginBottom: 5, color: '#555' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, backgroundColor: 'white' },
  inputError: { borderColor: 'red' },
   inputDisabled: { backgroundColor: '#e9ecef', color: '#6c757d' }, // Estilo para campos desabilitados
  errorText: { color: 'red', fontSize: 12, marginTop: 2 },
   cepLoading: { alignSelf: 'center', marginVertical: 5 },
  nextButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontSize: 16 },
});

export default CadastroEtapa1;