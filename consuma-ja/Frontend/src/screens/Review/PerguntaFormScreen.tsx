import React, { useState } from 'react';
import { View, Text, TextInput, Button, Switch, Alert, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import perguntaService from '../../services/perguntaService';
import { RootStackParamList } from '../../navigation/appNavigator';

// Tipagem forte para os parâmetros recebidos pela rota
type PerguntaFormRouteProp = RouteProp<RootStackParamList, 'PerguntaForm'>;

const PerguntaFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<PerguntaFormRouteProp>();
  
  // O parâmetro `pergunta` pode ou não existir.
  const perguntaExistente = route.params?.pergunta;
  
  const [descricao, setDescricao] = useState(perguntaExistente?.perguntas_descricao || '');
  const [ativo, setAtivo] = useState(perguntaExistente ? perguntaExistente.ativo : true);
  const [loading, setLoading] = useState(false);
  
  const isEditing = !!perguntaExistente;

  const handleSave = async () => {
    if (descricao.trim() === '') {
      Alert.alert("Campo Obrigatório", "A descrição da pergunta não pode estar vazia.");
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        await perguntaService.atualizar(perguntaExistente.perguntas_id, { perguntas_descricao: descricao, ativo });
        Alert.alert("Sucesso", "Pergunta atualizada com sucesso!");
      } else {
        await perguntaService.criar({ perguntas_descricao: descricao, ativo });
        Alert.alert("Sucesso", "Pergunta criada com sucesso!");
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a pergunta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Descrição da Pergunta</Text>
        <TextInput
          style={styles.input}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Ex: Qual a qualidade do produto?"
          multiline
        />
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Pergunta Ativa?</Text>
          <Switch 
            value={ativo} 
            onValueChange={setAtivo}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={ativo ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Criar Pergunta")}
            onPress={handleSave}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos básicos para o formulário
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 10
  },
  buttonContainer: {
    marginTop: 30
  }
});

export default PerguntaFormScreen;