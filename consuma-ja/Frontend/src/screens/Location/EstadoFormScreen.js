import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Keyboard } from 'react-native';
import locationService from '../../services/locationService';

const EstadoFormScreen = ({ route, navigation }) => {
  // Verifica se está editando (recebe 'estadoParaEditar' via parâmetros de rota)
  const estadoParaEditar = route.params?.estadoParaEditar;
  const isEditing = !!estadoParaEditar;

  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Preenche o formulário se estiver editando
  useEffect(() => {
    if (isEditing) {
      setNome(estadoParaEditar.estado_nome || '');
      setSigla(estadoParaEditar.estado_sigla || '');
      navigation.setOptions({ title: 'Editar Estado' }); // Muda título da tela
    } else {
         navigation.setOptions({ title: 'Adicionar Estado' });
    }
  }, [isEditing, estadoParaEditar, navigation]);

  const validarCampos = () => {
    const newErrors = {};
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!sigla.trim()) newErrors.sigla = 'Sigla é obrigatória';
    else if (sigla.trim().length < 2 || sigla.trim().length > 3) newErrors.sigla = 'Sigla deve ter 2 ou 3 caracteres';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss(); // Esconde o teclado
    if (!validarCampos()) {
      return;
    }

    setLoading(true);
    setErrors({}); // Limpa erros antigos

    const estadoData = {
      estado_nome: nome.trim(),
      estado_sigla: sigla.trim().toUpperCase(), // Envia sigla em maiúsculas
    };

    try {
      if (isEditing) {
        // --- Atualização ---
        await locationService.updateEstado(estadoParaEditar.estado_id, estadoData);
        Alert.alert('Sucesso', 'Estado atualizado com sucesso!');
      } else {
        // --- Criação ---
        await locationService.createEstado(estadoData);
        Alert.alert('Sucesso', 'Estado criado com sucesso!');
      }
      navigation.goBack(); // Volta para a tela anterior (lista)
    } catch (err) {
      console.error("Erro ao salvar estado:", err);
      const message = err.response?.data?.message || (isEditing ? "Não foi possível atualizar o estado." : "Não foi possível criar o estado.");
      // Exibe erros de validação do backend ou conflito
      if (err.response?.data?.errors) {
          Alert.alert("Erro de Validação", err.response.data.errors.join('\n'));
      } else if (err.response?.status === 409) { // Conflito (nome/sigla já existe)
           Alert.alert("Erro de Conflito", message);
      }
      else {
          Alert.alert("Erro", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Estado:</Text>
      <TextInput
        style={[styles.input, errors.nome ? styles.inputError : null]}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: São Paulo"
        maxLength={45}
      />
      {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}

      <Text style={styles.label}>Sigla (UF):</Text>
      <TextInput
        style={[styles.input, errors.sigla ? styles.inputError : null]}
        value={sigla}
        onChangeText={setSigla}
        placeholder="Ex: SP"
        maxLength={3}
        autoCapitalize="characters" // Ajuda a digitar em maiúsculas
      />
      {errors.sigla && <Text style={styles.errorText}>{errors.sigla}</Text>}

      <TouchableOpacity
        style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar Estado'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// --- Estilos --- (Adapte conforme necessário)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, marginBottom: 5, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
     backgroundColor: '#f9f9f9',
  },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', fontSize: 12, marginBottom: 10, marginTop: -10 },
  button: { padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  saveButton: { backgroundColor: '#0066cc' },
  buttonDisabled: { backgroundColor: '#a7c7e7' }, // Azul mais claro para desabilitado
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default EstadoFormScreen;