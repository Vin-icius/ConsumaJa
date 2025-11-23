import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { orderApiClient } from '../../api/client';

const ReclamacaoAdminListScreen = () => {
  const navigation = useNavigation();
  const [reclamacoes, setReclamacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarReclamacoes();
  }, []);

  const carregarReclamacoes = async () => {
    setLoading(true);
    try {
      const response = await orderApiClient.get('/reclamacoes');
      console.log("DADOS BRUTOS DO BACKEND:", JSON.stringify(response.data, null, 2)); // Log para ver o que chega
      setReclamacoes(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao carregar reclamações.');
    } finally {
      setLoading(false);
    }
  };

  const avaliarReclamacao = async (id: number, aprovado: boolean) => {
    try {
      await orderApiClient.patch(`/reclamacoes/${id}/avaliacao`, {
        aprovado,
        resposta: aprovado ? "Reclamação aceita. Iniciando devolução." : "Reclamação rejeitada após análise."
      });
      Alert.alert("Sucesso", `Reclamação ${aprovado ? 'Aprovada' : 'Rejeitada'}!`);
      carregarReclamacoes();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao processar ação.");
    }
  };

  const renderItem = ({ item }: any) => {
    console.log("Item individual:", item); 
  
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.titulo}</Text>
          <Text style={[styles.status, item.status === 'PENDENTE' ? styles.statusPendente : styles.statusResolvido]}>
            {item.status}
          </Text>
        </View>
        
        <Text style={styles.info}>Cliente: {item.pessoa_nome}</Text>
        <Text style={styles.desc}>{item.descricao}</Text>
        <Text style={styles.nota}>Insatisfação: {item.classificacao}/5</Text>

        {item.status === 'PENDENTE' && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.btnApprove]} 
              onPress={() => avaliarReclamacao(item.reclamacao_id, true)}
            >
              <Text style={styles.btnText}>Aprovar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.btnReject]} 
              onPress={() => avaliarReclamacao(item.reclamacao_id, false)}
            >
              <Text style={styles.btnText}>Rejeitar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={reclamacoes}
          keyExtractor={(item: any, index: number) => item?.reclamacao_id ? String(item.reclamacao_id) : String(index)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma reclamação encontrada.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f2f2f2' },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 12, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  title: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  status: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  statusPendente: { backgroundColor: '#fff3cd', color: '#856404' },
  statusResolvido: { backgroundColor: '#d4edda', color: '#155724' },
  info: { fontSize: 14, color: '#666', marginBottom: 5 },
  desc: { fontSize: 15, color: '#333', marginBottom: 10 },
  nota: { fontSize: 14, fontWeight: 'bold', color: '#d32f2f' },
  actions: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
  button: { flex: 0.48, padding: 12, borderRadius: 5, alignItems: 'center' },
  btnApprove: { backgroundColor: '#28a745' },
  btnReject: { backgroundColor: '#dc3545' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#777' }
});

export default ReclamacaoAdminListScreen;