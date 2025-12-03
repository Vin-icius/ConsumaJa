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
import { Ionicons } from '@expo/vector-icons'; // Para ícones de estrela

// --- Interfaces ---

// Item individual dentro do pedido (Ex: O Iogurte)
interface ProdutoVenda {
  produto_id: number;
  nome: string;
  quantidade: number;
  preco_unitario: string;
}

// O Pedido em si
interface EntregaItem {
  venda_id: number;
  data_venda: string;
  total: string;
  status: 'PENDENTE' | 'EM_TRANSITO' | 'ENTREGUE' | 'CANCELADO' | 'CONCLUIDA';
  itens: ProdutoVenda[];
}

const EntregasScreen = () => {
  const navigation = useNavigation<any>();
  const userIdReal = 1004;

  const [refreshing, setRefreshing] = useState(false);
  const [entregas, setEntregas] = useState<EntregaItem[]>([]);

  const carregarEntregas = async () => {
    setRefreshing(true);
    
    // Simulação com dados estruturados
    setTimeout(() => {
      const dadosDoBanco: EntregaItem[] = [
        {
          venda_id: 8,
          data_venda: new Date().toLocaleDateString(),
          total: 'R$ 11,98',
          status: 'ENTREGUE',
          itens: [
            { produto_id: 1, nome: 'Iogurte Natural 170g', quantidade: 2, preco_unitario: 'R$ 5,99' }
          ]
        },
        {
          venda_id: 5,
          data_venda: '20/02/2025',
          total: 'R$ 25,90',
          status: 'EM_TRANSITO', // Aqui não aparece botão de avaliar
          itens: [
            { produto_id: 2, nome: 'Suco de Laranja 1L', quantidade: 1, preco_unitario: 'R$ 15,90' },
            { produto_id: 3, nome: 'Bolo de Pote', quantidade: 1, preco_unitario: 'R$ 10,00' }
          ]
        }
      ];
      setEntregas(dadosDoBanco);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    carregarEntregas();
  }, []);

  // --- Ações ---

  const handleRelatarProblema = (vendaId: number) => {
    navigation.navigate('ReclamacaoForm', {
      vendaId: vendaId,
      pessoaId: userIdReal 
    });
  };

  const handleAvaliarProduto = (produto: ProdutoVenda, vendaId: number) => {
    console.log(`Avaliando Produto ID: ${produto.produto_id} da Venda: ${vendaId}`);
    
    navigation.navigate('AvaliacaoForm', {
      pedidoId: vendaId,
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

  // --- Renderização ---

  const renderProdutoItem = (produto: ProdutoVenda, vendaStatus: string, vendaId: number) => (
    <View key={produto.produto_id} style={styles.productRow}>
      <View style={styles.productInfo}>
        <Text style={styles.productQty}>{produto.quantidade}x</Text>
        <Text style={styles.productName}>{produto.nome}</Text>
      </View>
      
      {/* Só mostra botão de avaliar se foi entregue */}
      {vendaStatus === 'ENTREGUE' && (
        <TouchableOpacity 
          style={styles.btnAvaliar} 
          onPress={() => handleAvaliarProduto(produto, vendaId)}
        >
          <Ionicons name="star-outline" size={16} color="#FFD700" />
          <Text style={styles.btnAvaliarText}>Avaliar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: EntregaItem }) => (
    <View style={styles.card}>
      {/* Cabeçalho do Pedido */}
      <View style={styles.header}>
        <Text style={styles.orderId}>Pedido #{item.venda_id}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <Text style={styles.date}>Data: {item.data_venda}</Text>

      {/* Lista de Produtos do Pedido */}
      <View style={styles.productList}>
        {item.itens.map(prod => renderProdutoItem(prod, item.status, item.venda_id))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.total}>Total: {item.total}</Text>
        
        <TouchableOpacity 
          style={styles.btnProblem} 
          onPress={() => handleRelatarProblema(item.venda_id)}
        >
          <Text style={styles.btnProblemText}>Abrir Reclamação</Text>
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
  
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  date: { fontSize: 13, color: '#888', marginBottom: 10 },

  // Estilos da Lista de Produtos
  productList: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 5, paddingTop: 5 },
  productRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9'
  },
  productInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  productQty: { fontWeight: 'bold', marginRight: 8, color: '#555' },
  productName: { fontSize: 14, color: '#333', flexWrap: 'wrap', flex: 1 },
  
  btnAvaliar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 6, 
    borderRadius: 5, 
    borderWidth: 1, 
    borderColor: '#FFD700',
    backgroundColor: '#fffff0' 
  },
  btnAvaliarText: { fontSize: 12, color: '#b8860b', marginLeft: 4, fontWeight: '600' },

  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 15,
    paddingTop: 10,
  },
  total: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  
  btnProblem: { paddingHorizontal: 12, paddingVertical: 8 },
  btnProblemText: { color: '#d32f2f', fontWeight: '600', fontSize: 14 },
  
  emptyText: { textAlign: 'center', marginTop: 30, color: '#888' }
});

export default EntregasScreen;