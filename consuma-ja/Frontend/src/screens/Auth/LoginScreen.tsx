import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../services/authService';

const LoginScreen = ({ navigation }) => {
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [identifier, setIdentifier] = useState(''); // Campo unificado para Login/CPF/CNPJ/Email
  const [loading, setLoading] = useState(false); // Estado de loading

  // Funções de formatação CPF/CNPJ (opcional, pode remover se quiser input livre)
  const formatInput = (text: string) => {
    const cleaned = text.replace(/\D/g, ''); // Remove não dígitos
    if (/^\d{1,3}$/.test(cleaned)) { // Admin ID (até 3 dígitos)
      return cleaned;
    } else if (cleaned.length <= 11) { // Formata como CPF
      return formatCPF(cleaned);
    } else if (cleaned.length <= 14) { // Formata como CNPJ
        return formatCNPJ(cleaned);
    }
    // Se não for numérico ou exceder 14, retorna o que foi digitado (permite email/login)
    // Ou limita o tamanho se desejar
    return text.length <= 18 ? text : text.substring(0, 18); // Limita para evitar inputs gigantes
  };

  const formatCPF = (value: string): string => {
    value = value.slice(0, 11); // Limita ao tamanho do CPF
    if (value.length <= 3) return value;
    if (value.length <= 6) return value.replace(/(\d{3})(\d{1,})/, '$1.$2');
    if (value.length <= 9) return value.replace(/(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3');
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3-$4');
  };

  const formatCNPJ = (value: string): string => {
     value = value.slice(0, 14); // Limita ao tamanho do CNPJ
    if (value.length <= 2) return value;
    if (value.length <= 5) return value.replace(/(\d{2})(\d{1,})/, '$1.$2');
    if (value.length <= 8) return value.replace(/(\d{2})(\d{3})(\d{1,})/, '$1.$2.$3');
    if (value.length <= 12) return value.replace(/(\d{2})(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3/$4');
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,})/, '$1.$2.$3/$4-$5');
  };

   // Atualiza state e aplica formatação (ou não, se for email/login)
  const handleIdentifierChange = (text: string) => {
     // Permite email ou login textual diretamente
     if (text.includes('@') || !/^\d{1,14}$/.test(text.replace(/\D/g, '')) && text.length > 3) { // Se tem @ ou não parece numérico (exceto admin id)
         setIdentifier(text);
     } else {
         // Aplica formatação se for numérico (CPF/CNPJ/Admin ID)
         setIdentifier(formatInput(text));
     }
  };

  // --- LOGIN HANDLER ATUALIZADO ---
  const handleLogin = async () => {
    Keyboard.dismiss();
    setErrorMessage(''); // Limpa erro anterior

    // Remove formatação para enviar ao backend (backend pode fazer isso também)
    // Mas vamos enviar o identificador como o usuário digitou (formatado ou não)
    // O backend no findByLoginOrEmailOrDoc já remove a formatação se necessário
    const loginToSend = identifier.trim();

    if (!loginToSend) {
        setErrorMessage('Preencha o campo Login/Email/CPF/CNPJ.');
        return;
    }
    if (!senha) {
        setErrorMessage('Preencha a senha.');
        return;
    }

    setLoading(true); // Ativa loading

    try {
      console.log(`[LoginScreen] Tentando login com: ${loginToSend}`);
      const response = await authService.login({
          login: loginToSend, // Envia o identificador
          senha: senha,
      });

      console.log('[LoginScreen] Login bem-sucedido:', response);

      // Login OK - Armazenar dados e navegar
      const { token, user } = response;
      if (token && user?.tipo) {
          // Salvar token e tipo do usuário
          await AsyncStorage.setItem('userToken', token); // <<< Salva o TOKEN JWT
          await AsyncStorage.setItem('userType', user.tipo); // <<< Salva o TIPO
          console.log('[LoginScreen] Token e userType salvos.');

          // Navegar para o Dashboard substituindo a tela de Login
          navigation.replace('Dashboard');
      } else {
          // Resposta inesperada do backend
          console.error("[LoginScreen] Resposta da API de login inválida:", response);
          setErrorMessage("Erro inesperado na resposta do servidor.");
      }

    } catch (error: any) {
      console.error('[LoginScreen] Erro no handleLogin:', error);
      // Tenta pegar a mensagem de erro do backend (via interceptor do Axios)
      const message = error.response?.data?.message || // Erro do AppError
                      error.message || // Erro genérico do Axios ou outros
                      "Erro ao tentar fazer login. Verifique suas credenciais ou conexão.";
      setErrorMessage(message);
    } finally {
      setLoading(false); // Desativa loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo</Text>
      {/* Campo unificado */}
      <TextInput
        style={styles.input}
        placeholder="Login, Email, CPF ou CNPJ"
        // Ajustar keyboardType dependendo se permite texto ou não
        // keyboardType="default" // Permite texto e números
        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'} // Melhor para CPF/CNPJ, mas dificulta email/login
        value={identifier}
        onChangeText={handleIdentifierChange} // Usa o novo handler
        maxLength={50} // Aumentar max length para email/login
        autoCapitalize="none" // Desabilitar auto capitalize para email/login
        autoComplete="username" // Ajuda no preenchimento
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        autoComplete="password" // Ajuda no preenchimento
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]} // Estilo desabilitado
          onPress={handleLogin}
          disabled={loading} // Desabilita botão durante o loading
      >
        {loading ? (
            <ActivityIndicator size="small" color="#fff" />
        ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Links mantidos */}
      <TouchableOpacity onPress={() => navigation.navigate('CadastroEtapa1')}>
        <Text style={styles.linkText}>Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos com ajuste para botão desabilitado
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 45, borderColor: '#ccc', borderWidth: 1, marginBottom: 12, paddingLeft: 10, borderRadius: 5, backgroundColor: 'white' },
  loginButton: { backgroundColor: '#0066cc', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: 10, minHeight: 45 }, // Altura mínima
  buttonDisabled: { backgroundColor: '#a7c7e7' }, // Cor para desabilitado
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#0066cc', textAlign: 'center', marginTop: 15, fontSize: 14 },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 }
});

export default LoginScreen;