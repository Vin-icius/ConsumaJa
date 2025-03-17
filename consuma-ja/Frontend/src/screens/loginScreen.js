import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');

  const formatCPF = (value) => {
    value = value.replace(/\D/g, '');
    if (value.length <= 3) return value;
    if (value.length <= 6) return value.replace(/(\d{3})(\d{1,})/, '$1.$2');
    if (value.length <= 9) return value.replace(/(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3');
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3-$4');
  };

  const formatCNPJ = (value) => {
    value = value.replace(/\D/g, '');
    if (value.length <= 2) return value;
    if (value.length <= 5) return value.replace(/(\d{2})(\d{1,})/, '$1.$2');
    if (value.length <= 8) return value.replace(/(\d{2})(\d{3})(\d{1,})/, '$1.$2.$3');
    if (value.length <= 12) return value.replace(/(\d{2})(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3/$4');
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,})/, '$1.$2.$3/$4-$5');
  };

  const handleChange = (text) => {
    let formattedText = text.replace(/\D/g, '');
    if (formattedText.length === 1) {
      setCpfCnpj(formattedText);
    } else if (formattedText.length <= 11) {
      setCpfCnpj(formatCPF(formattedText));
    } else if (formattedText.length <= 14) {
      setCpfCnpj(formatCNPJ(formattedText));
    }
  };

  const handleLogin = async () => {
    if (!cpfCnpj || (cpfCnpj.length !== 1 && cpfCnpj.length !== 14 && cpfCnpj.length !== 18)) {
      setErrorMessage('Por favor, preencha um CPF ou CNPJ válido.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5178/api/Pessoa/login/', {
        login: cpfCnpj.replace(/\D/g, ''), // Remove formatação de CPF/CNPJ
        senha: senha
      });
  
      if (response.status === 200) {
        const token = response.data.token;
        console.log('Token:', token);
  
        // Salva o token localmente (localStorage ou AsyncStorage)
        await AsyncStorage.setItem('token', token);
  
        Alert.alert('Login bem-sucedido!', 'Você foi autenticado com sucesso.');
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.error('Erro de login:', error);

    if (error.response) {
      if (error.response.status === 401) {
          setErrorMessage('Login ou senha incorretos.');
        } else {
          setErrorMessage('Erro ao tentar fazer login. Tente novamente.');
        }
      } else {
        setErrorMessage('Erro de conexão. Verifique sua rede.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu Login, CPF ou CNPJ"
        keyboardType="numeric"
        value={cpfCnpj}
        onChangeText={handleChange}
        maxLength={18}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setForgotPasswordVisible(true)}>
        <Text style={styles.linkText}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('CadastroEtapa1')}>
        <Text style={styles.linkText}>Cadastre-se</Text>
      </TouchableOpacity>

      <Modal visible={forgotPasswordVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={() => setForgotPasswordVisible(false)} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Recuperar Senha</Text>
            <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} />
            <TouchableOpacity style={styles.loginButton} onPress={() => Alert.alert('Senha enviada!', 'Verifique seu e-mail para recuperar a senha.')}>
              <Text style={styles.loginButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  loginButton: {
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
  },
  linkText: {
    color: '#0066cc',
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-start',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default LoginScreen;
