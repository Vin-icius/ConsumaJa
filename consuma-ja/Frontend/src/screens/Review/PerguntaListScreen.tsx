import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Switch, Button, SafeAreaView, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import perguntaService, { Pergunta } from '../../services/perguntaService';
// --- IMPORTAÇÕES CORRIGIDAS ---
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../../navigation/appNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';

// --- TIPAGEM COMPOSTA PARA A NAVEGAÇÃO (A SOLUÇÃO) ---
// Este tipo diz: "Eu sou uma tela de Drawer, mas também posso navegar em um Stack"
type PerguntaListNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<any, 'PerguntaList'>, // Navegador primário (onde a tela vive)
  NativeStackNavigationProp<RootStackParamList> // Navegador secundário (para onde ela pode pular)
>;

const PerguntaListScreen = () => {
  const navigation = useNavigation<PerguntaListNavigationProp>();
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      await perguntaService.atualizar(pergunta.perguntas_id, { ativo: !pergunta.ativo });
      setPerguntas(prevPerguntas => 
        prevPerguntas.map(p => 
          p.perguntas_id === pergunta.perguntas_id ? { ...p, ativo: !p.ativo } : p
        )
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o status da pergunta.");
    }
  };

  const handleExcluir = (pergunta: Pergunta) => {
    Alert.alert(
      "Confirmar Desativação",
      `Tem certeza que deseja desativar a pergunta: "${pergunta.perguntas_descricao}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desativar",
          style: "destructive",
          onPress: async () => {
            try {
              await perguntaService.excluir(pergunta.perguntas_id);
              Alert.alert("Sucesso", "Pergunta desativada.");
              fetchPerguntas(true);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível desativar a pergunta.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Pergunta }) => (
    <View style={styles.listItem}>
      <Text style={styles.itemText}>{item.perguntas_descricao}</Text>
      <View style={styles.actionsContainer}>
        <Switch
          value={item.ativo}
          onValueChange={() => handleToggleAtivo(item)}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={item.ativo ? "#f5dd4b" : "#f4f3f4"}
        />
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('PerguntaForm', { pergunta: item })}>
          <Ionicons name="pencil-outline" size={24} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleExcluir(item)}>
          <Ionicons name="trash-outline" size={24} color="#d9534f" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && perguntas.length === 0) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button title="Adicionar Nova Pergunta" onPress={() => navigation.navigate('PerguntaForm', {})} />
      </View>
      <FlatList
        data={perguntas}
        renderItem={renderItem}
        keyExtractor={(item) => item.perguntas_id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma pergunta cadastrada.</Text>}
        refreshing={loading}
        onRefresh={() => fetchPerguntas(true)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', backgroundColor: 'white' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { flex: 1, fontSize: 16, marginRight: 10 },
  actionsContainer: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 15 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', marginBottom: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' }
});

export default PerguntaListScreen;