import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Switch, Button, SafeAreaView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import perguntaService, { Pergunta } from '../../services/perguntaService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../../navigation/appNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';
import { perguntaListStyles as styles } from '../../common/styles/Review/perguntaListScreen.styled'; // Importando o novo estilo

type PerguntaListNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<any, 'PerguntaList'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const PerguntaListScreen = () => {
  const navigation = useNavigation<PerguntaListNavigationProp>();
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false); // Novo estado para operações rápidas

  const fetchPerguntas = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError(null);
    try {
      const data = await perguntaService.listarTodas();
      setPerguntas(data);
    } catch (err) {
      setError("Não foi possível carregar as perguntas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPerguntas();
    }, [fetchPerguntas])
  );

  const handleToggleAtivo = async (pergunta: Pergunta) => {
    setOperationLoading(true);
    try {
      if (pergunta.ativo) {
        await perguntaService.excluirLogico(pergunta.perguntas_id);
      } else {
        await perguntaService.atualizar(pergunta.perguntas_id, { ativo: true });
      }
      fetchPerguntas(true);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o status da pergunta.");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleExcluirFisico = async (pergunta: Pergunta) => {
    // Para feedback visual imediato
    setOperationLoading(true);

    try {
      // Chama o serviço de exclusão diretamente
      await perguntaService.excluirFisico(pergunta.perguntas_id);
      
      // Informa o usuário do sucesso
      Alert.alert("Sucesso", "Pergunta excluída permanentemente.");
      
      // Recarrega a lista para remover o item da tela
      fetchPerguntas(true);

    } catch (err: any) {
      // A lógica para tratar erros específicos (como o 409) continua aqui
      if (err.response?.status === 409) {
        Alert.alert("Ação Bloqueada", err.response.data.message);
      } else {
        Alert.alert("Erro", "Não foi possível excluir a pergunta.");
      }
    } finally {
      // Garante que o loading seja desativado, mesmo se houver erro
      setOperationLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Pergunta }) => (
    <View style={styles.listItem}>
      <View style={styles.itemContent}>
        <Text style={styles.itemText} numberOfLines={2}>{item.perguntas_descricao}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <Switch
          value={item.ativo}
          onValueChange={() => handleToggleAtivo(item)}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={item.ativo ? "#f5dd4b" : "#f4f3f4"}
        />
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => navigation.navigate('PerguntaForm', { pergunta: item })}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleExcluirFisico(item)}>
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#28a745" /></View>;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Tentar Novamente" onPress={() => fetchPerguntas()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={perguntas}
          renderItem={renderItem}
          keyExtractor={(item) => item.perguntas_id.toString()}
          style={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma pergunta cadastrada.</Text>}
          refreshing={loading}
          onRefresh={() => fetchPerguntas(true)}
        />
        <View style={styles.addButtonContainer}>
            <Button title="Adicionar Nova Pergunta" onPress={() => navigation.navigate('PerguntaForm', {})} color="#28a745" />
        </View>
        {operationLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PerguntaListScreen;