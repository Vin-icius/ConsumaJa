import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {

    // Validação de exemplo: campo de CPF e Senha não podem estar vazios, alterar lógica depois
    if (!cpf || !senha) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    // Lógica de autenticação (comentei o código para API, substituir quando o backend estiver no naipe)
    try {
      // Chamada para a API via Axios
      /*
      const response = await axios.post('https://localhost:7266/api/User/login', {
        email: "exemplo@email.com",
        password: "123456"
      });

      if (response.data.success) {
        Alert.alert('Login bem-sucedido!', `Bem-vindo, ${cpf}`);
        navigation.navigate('Dashboard'); // Redirecionamento para a tela de Dashboard
      } else {
        setErrorMessage('Credenciais inválidas.');
      }
      */

      // Simulação de login bem-sucedido (substituir com a API)
      Alert.alert('Login bem-sucedido!', `Bem-vindo, ${cpf}`);
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error(error);
      setErrorMessage('Ocorreu um erro, tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Bem-vindo</Text>
        <Text style={styles.subtitleText}>Entre com seu CPF/CNPJ</Text>
      </View>

      {/* Campos de entrada */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="CPF/CNPJ ou email"
          placeholderTextColor="#9CA3AF"
          value={cpf}
          onChangeText={setCpf}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#9CA3AF"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
      </View>

      {/* Mensagem de erro */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {/* Botão de Login */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2F4F4F',
  },
  subtitleText: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
