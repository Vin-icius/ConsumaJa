import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const CadastroEtapa1 = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    login: '',
    senha: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  });
  const [errors, setErrors] = useState({});

  const validarCampos = () => {
    let newErrors = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email.includes('@')) newErrors.email = 'E-mail inválido';
    if (formData.telefone.length < 10) newErrors.telefone = 'Telefone inválido';
    if (!formData.login) newErrors.login = 'Login é obrigatório';
    if (formData.senha.length < 6) newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    if (!formData.cep.match(/^\d{5}-\d{3}$/)) newErrors.cep = 'CEP inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validarCampos()) {
      navigation.navigate('CadastroEtapa2', { formData });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Etapa 1</Text>
      {Object.keys(formData).map((key) => (
        <TextInput
          key={key}
          style={[styles.input, errors[key] ? styles.inputError : null]}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          value={formData[key]}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
        />
      ))}
      {Object.values(errors).map((err, index) => (
        <Text key={index} style={styles.errorText}>{err}</Text>
      ))}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.buttonText}>Próximo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', fontSize: 12, marginBottom: 5 },
  nextButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16 },
});

export default CadastroEtapa1;