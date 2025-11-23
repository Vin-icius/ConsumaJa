import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Interface
interface EntregaItem {
  venda_id: number;
  data_venda: string;
  total: string;
  status: 'PENDENTE' | 'EM_TRANSITO' | 'ENTREGUE' | 'CANCELADO';
  produtos: string;
}

const EntregasScreen = () => {
  const navigation = useNavigation<any>();
  
  // IMPORTANTE: Esse ID deve bater com o ID do Cliente 'Maria' no banco (Geralmente 1)
  const userIdReal = 1004; 

  const [refreshing, setRefreshing] = useState(false);
  const [entregas, setEntregas] = useState<EntregaItem[]>([]);

  const carregarEntregas = async () => {
    setRefreshing(true);
    
    // --- SIMULAÇÃO DE CHAMADA AO BACKEND ---
    // (Como ainda não criamos a rota GET /vendas no backend, usamos dados locais
    // mas com o ID DA VENDA REAL que existe no banco para a reclamação funcionar)
    
    setTimeout(() => {
      const dadosDoBanco: EntregaItem[] = [
        {
          venda_id: 6, // <--- ESTE ID PRECISA EXISTIR NO BANCO 'VENDA'
          data_venda: new Date().toLocaleDateString(),
          total: 'R$ 50,00',
          status: 'ENTREGUE',
          produtos: 'Pedido Teste (Dados do Banco)'
        }
      ];
      setEntregas(dadosDoBanco);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    carregarEntregas();
  }, []);

  const handleRelatarProblema = (vendaId: number) => {
    console.log(`Iniciando reclamação para Venda: ${vendaId}, Pessoa: ${userIdReal}`);
    
    navigation.navigate('ReclamacaoForm', {
      vendaId: vendaId,
      pessoaId: userIdReal 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENTREGUE': return '#4caf50';
      case 'EM_TRANSITO': return '#2196f3';
      case 'PENDENTE': return '#ff9800';
      case 'CANCELADO': return '#f44336';
      default: return '#777';
    }
  };

  const renderItem = ({ item }: { item: EntregaItem }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Pedido #{item.venda_id}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <Text style={styles.date}>Data: {item.data_venda}</Text>
      <Text style={styles.products} numberOfLines={2}>{item.produtos}</Text>
      <Text style={styles.total}>Total: {item.total}</Text>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.btnProblem} 
          onPress={() => handleRelatarProblema(item.venda_id)}
        >
          <Text style={styles.btnProblemText}>Relatar Problema</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={entregas}
        keyExtractor={(item) => item.venda_id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={carregarEntregas} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  date: { fontSize: 14, color: '#666', marginBottom: 4 },
  products: { fontSize: 14, color: '#444', marginBottom: 8, fontStyle: 'italic' },
  total: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btnProblem: { padding: 10, borderRadius: 6, backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#ffcdd2' },
  btnProblemText: { color: '#d32f2f', fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#888' }
});

export default EntregasScreen;