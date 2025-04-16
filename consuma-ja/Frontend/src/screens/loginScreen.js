import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const API_URL = "http://localhost:3000/api/Pessoa/login"; // ve o seu IP com `ipconfig` (Windows) ou `ip a` (Linux)

  const handleLogin = async () => {
    if (!cpfCnpj && (cpfCnpj.length == 14 || cpfCnpj.length == 18 || cpfCnpj.length <=3)) {
        setErrorMessage('Por favor, preencha um CPF ou CNPJ válido.');
        return;
    }
    try {
      /*
        const response = await fetch(API_URL, { // Usa a URL correta
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: cpfCnpj.replace(/\D/g, ''),
                senha: senha
            })
        });
        */

        //const data = await response.json();

        if (true) {
            Alert.alert('Login bem-sucedido!', 'Você foi autenticado com sucesso.');
            navigation.navigate('Dashboard');
        } else {
            setErrorMessage(data.message || 'Erro ao tentar fazer login.');
        }
    } catch (error) {
        console.error('Erro de login:', error);
        setErrorMessage('Erro de conexão. Verifique sua rede.');
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
  }
});

export default LoginScreen;