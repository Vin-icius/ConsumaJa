import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { orderApiClient } from '../../api/client';
import reclamacaoService from '../../services/reclamacaoService';

const ReclamacaoFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  
  // Recebe os IDs da tela de Entregas
  const { vendaId, pessoaId } = route.params || {};

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("--- TELA DE RECLAMAÇÃO ---");
    console.log(`Venda ID: ${vendaId}`);
    console.log(`Pessoa ID: ${pessoaId}`);
  }, []);

  const handleSubmit = async () => {
    // 1. Validação Básica
    if (!titulo || !descricao || !classificacao) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    // 2. Validação da Nota
    const nota = parseInt(classificacao);
    if (isNaN(nota) || nota < 1 || nota > 5) {
      Alert.alert('Nota Inválida', 'A classificação deve ser um número entre 1 e 5.');
      return;
    }

    // 3. Validação de Segurança (IDs)
    if (!vendaId || !pessoaId) {
      Alert.alert('Erro Técnico', 'IDs de venda ou cliente não identificados. Volte e tente novamente.');
      return;
    }

    setLoading(true);

    try {
      // A chamada agora usa o método do objeto reclamacaoService
      await reclamacaoService.criarReclamacao({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        classificacao: parseInt(classificacao),
        venda_id: vendaId,
        pessoa_id: pessoaId
      });
      
      Alert.alert('Sucesso', 'Reclamação registrada com sucesso!');
      navigation.goBack();

    } catch (err: any) {
      // O erro já vem tratado ou logado pelo handleRequest do service
      const message = err.response?.data?.message || "Não foi possível registrar a reclamação.";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Caixa de Debug Visual (Para você ter certeza que os dados chegaram) */}
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>
            Ref. Pedido: #{vendaId || '?'} | Cliente: #{pessoaId || '?'}
          </Text>
        </View>

        <Text style={styles.label}>Título do Problema</Text>
        <TextInput 
          style={styles.input} 
          value={titulo} 
          onChangeText={setTitulo}
          placeholder="Ex: Produto veio aberto"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Descrição Detalhada</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          value={descricao} 
          onChangeText={setDescricao} 
          multiline 
          numberOfLines={4}
          placeholder="Conte o que aconteceu..."
          placeholderTextColor="#999"
          textAlignVertical="top"
        />

        <Text style={styles.label}>Nota de Insatisfação (1 a 5)</Text>
        <TextInput 
          style={styles.input} 
          value={classificacao} 
          onChangeText={setClassificacao} 
          keyboardType="numeric" 
          placeholder="1 = Muito insatisfeito"
          placeholderTextColor="#999"
          maxLength={1}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrar Reclamação</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  debugBox: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 4, marginBottom: 20, alignItems: 'center' },
  debugText: { color: '#555', fontSize: 12, fontFamily: 'monospace' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fafafa' },
  textArea: { height: 120 },
  button: { backgroundColor: '#d32f2f', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  buttonDisabled: { backgroundColor: '#e57373' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ReclamacaoFormScreen;