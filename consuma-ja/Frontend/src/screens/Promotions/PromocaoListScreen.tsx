// src/screens/Promotions/PromocaoListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import promocaoService from '../../services/promocaoService';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Tipo para o item da lista de promoções (admin view)
interface PromocaoAdminItem {
    promocao_id: number;
    promocao_descricao?: string | null;
    fornecedor?: { pessoa_nome?: string }; // Ajuste se o backend retornar o ID ou objeto completo
    inicio: string | Date;
    fim?: string | Date | null;
    ativo: boolean;
}

// Tipagem Navegação (opcional)
// type PromotionStackParamList = {
//   PromocaoList: undefined;
//   PromocaoForm: { promocaoId?: number }; // Passa ID para edição
// };
// type PromocaoListNavigationProp = NativeStackNavigationProp<PromotionStackParamList, 'PromocaoList'>;

const PromocaoListItem = ({ item, onEdit, onDelete }: { item: PromocaoAdminItem, onEdit: (item: PromocaoAdminItem) => void, onDelete: (item: PromocaoAdminItem) => void }) => (
  <View style={[styles.listItem, !item.ativo && styles.listItemInactive]}>
    <View style={styles.listItemText}>
        <Text style={styles.itemTextTitle}>{item.promocao_id} - {item.promocao_descricao || 'Promoção sem descrição'}</Text>
        <Text style={styles.itemSubText}>Fornecedor: {item.fornecedor?.pessoa_nome || 'N/A'}</Text>
        <Text style={styles.itemSubText}>Início: {new Date(item.inicio).toLocaleDateString()}</Text>
        {item.fim && <Text style={styles.itemSubText}>Fim: {new Date(item.fim).toLocaleDateString()}</Text>}
        <Text style={item.ativo ? styles.statusActive : styles.statusInactive}>
            Status: {item.ativo ? 'Ativa' : 'Inativa'}
        </Text>
    </View>
    <View style={styles.listItemButtons}>
        <TouchableOpacity onPress={() => onEdit(item)} style={[styles.button, styles.editButton]}>
             <Ionicons name="pencil-outline" size={18} color="white" />
        </TouchableOpacity>
        {/* Botão para desativar ou reativar */}
        <TouchableOpacity onPress={() => onDelete(item)} style={[styles.button, item.ativo ? styles.deleteButton : styles.activateButton]}>
             <Ionicons name={item.ativo ? "trash-outline" : "checkmark-circle-outline"} size={18} color="white" />
        </TouchableOpacity>
    </View>
  </View>
);

const PromocaoListScreen = () => {
  const navigation = useNavigation<any>(); // Use o tipo correto se definido
  const [promocoes, setPromocoes] = useState<PromocaoAdminItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPromocoesAdmin = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError(null);
    try {
      // No backend, o service/repo de promoção já deve tratar o filtro 'TODAS'
      // e buscar o nome do fornecedor via JOIN
      const data = await promocaoService.listarPromocoes(); // Exemplo para buscar todas
      setPromocoes(data || []);
    } catch (err: any) {
      console.error("Erro buscar promoções admin (Tela):", err.response?.data || err.message || err);
      setError("Erro ao carregar promoções.");
      setPromocoes([]);
    } finally {
      if (!isRefreshing) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchPromocoesAdmin(); }, [fetchPromocoesAdmin]));

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPromocoesAdmin(true);
  };

  const handleEdit = (promocao: PromocaoAdminItem) => {
    navigation.navigate('PromocaoForm', { promocaoId: promocao.promocao_id });
  };

  const handleDeleteToggle = (promocao: PromocaoAdminItem) => {
    const actionText = promocao.ativo ? "desativar" : "reativar";
    const newStatus = !promocao.ativo;
    Alert.alert(
      `Confirmar ${actionText}`,
      `Tem certeza que deseja ${actionText} a promoção "${promocao.promocao_descricao || promocao.promocao_id}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: `Sim, ${actionText}`,
          style: promocao.ativo ? "destructive" : "default",
          onPress: async () => {
            setLoading(true);
            try {
              if (promocao.ativo) {
                // Exclusão lógica (desativa)
                await promocaoService.excluirPromocao(promocao.promocao_id);
              } else {
                // Reativar: Backend precisaria de um endpoint ou o atualizar aceitar 'ativo: true'
                await promocaoService.atualizarPromocao(promocao.promocao_id, { ativo: newStatus });
              }
              Alert.alert("Sucesso", `Promoção ${actionText} com sucesso!`);
              fetchPromocoesAdmin(); // Recarrega a lista
            } catch (err: any) {
              const msg = err.response?.data?.message || err.message || `Erro ao ${actionText}.`;
              Alert.alert("Erro", msg);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // <<< FUNÇÃO RENDERCONTENT COMPLETA E CORRETA >>>
  const renderContent = () => {
    if (loading && !refreshing && promocoes.length === 0) { // Mostrar loading só se lista vazia no load inicial
        return <ActivityIndicator size="large" color="#007bff" style={styles.centered} />;
    }
    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => fetchPromocoesAdmin()} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }
    if (promocoes.length === 0 && !loading) { // Se não está carregando e não tem promoções
        return (
             <View style={styles.centered}>
                <Text style={styles.emptyText}>Nenhuma promoção encontrada.</Text>
                <Text style={styles.emptySubText}>(Pull-to-refresh para atualizar)</Text>
            </View>
        );
    }
    // Se chegou aqui, tem promoções para listar
    return (
      <FlatList
        data={promocoes}
        keyExtractor={(item) => item.promocao_id.toString()}
        renderItem={({ item }) => (
          <PromocaoListItem item={item} onEdit={handleEdit} onDelete={handleDeleteToggle} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#007bff"]} // Cor do indicador de refresh
                tintColor={"#007bff"} // Cor no iOS
            />
        }
      />
    );
  };
  // <<< FIM DA FUNÇÃO RENDERCONTENT >>>

  return (
    <View style={styles.container}>
       <TouchableOpacity
         style={[styles.button, styles.addButton]}
         onPress={() => navigation.navigate('PromocaoForm')} // Modo criação
       >
         <Ionicons name="add-circle-outline" size={22} color="white" style={{marginRight: 8}}/>
         <Text style={styles.buttonText}>Nova Promoção</Text>
       </TouchableOpacity>
      {renderContent()} {/* Chama a função aqui */}
       {/* Overlay de Loading para ações como delete/update (opcional, já incluído no loading geral) */}
       {/* {loading && !refreshing && promocoes.length > 0 && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>} */}
    </View>
  );
};

// Estilos (Adapte de CategoriaListScreen.tsx ou outras listas)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' }, // Cor de fundo suave
    list: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 20 },
    listItem: { backgroundColor: 'white', padding: 15, marginBottom: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
    listItemInactive: { opacity: 0.6, backgroundColor: '#e9ecef' },
    listItemText: { flex: 1, marginRight: 10 },
    listItemButtons: { flexDirection: 'row', alignItems: 'center' },
    itemTextTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
    itemSubText: { fontSize: 13, color: '#555', marginBottom: 2 },
    statusActive: { fontSize: 12, color: 'green', fontWeight: 'bold', marginTop: 4 },
    statusInactive: { fontSize: 12, color: 'red', fontWeight: 'bold', marginTop: 4 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: '#d9534f', fontSize: 16, textAlign: 'center', marginBottom: 10 },
    retryButton: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginTop: 15},
    retryButtonText: { color: 'white', fontSize: 15, fontWeight: '500'},
    emptyText: { fontSize: 16, color: '#6c757d', textAlign: 'center' },
    emptySubText: { fontSize: 13, color: '#868e96', textAlign: 'center', marginTop: 5 },
    button: { padding: 10, borderRadius: 25, marginLeft: 8, justifyContent: 'center', alignItems: 'center', width: 44, height: 44 }, // Botões redondos
    editButton: { backgroundColor: '#ffc107' },
    deleteButton: { backgroundColor: '#dc3545' },
    activateButton: { backgroundColor: '#28a745'},
    addButton: { width: 'auto', height: 'auto', backgroundColor: '#007bff', marginVertical: 10, marginHorizontal:15, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'stretch', alignItems: 'center', borderRadius: 8, flexDirection: 'row', justifyContent: 'center', elevation: 2 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    // loadingOverlay: { /* ... */ } // Pode ser removido se o loading principal for suficiente
});

export default PromocaoListScreen;