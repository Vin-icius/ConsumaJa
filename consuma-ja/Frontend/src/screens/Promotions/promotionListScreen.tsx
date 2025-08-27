// src/screens/Promotions/PromocaoListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import promocaoService from '../../services/promocaoService';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { promotionListStyles } from '../../common/styles/Promotions/promotionListScreen.styled';

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

const PromotionListItem = ({ item, onEdit, onDelete }: { item: PromocaoAdminItem, onEdit: (item: PromocaoAdminItem) => void, onDelete: (item: PromocaoAdminItem) => void }) => (
  <View style={[promotionListStyles.listItem, !item.ativo && promotionListStyles.listItemInactive]}>
    <View style={promotionListStyles.listItemText}>
        <Text style={promotionListStyles.itemTextTitle}>{item.promocao_id} - {item.promocao_descricao || 'Promoção sem descrição'}</Text>
        <Text style={promotionListStyles.itemSubText}>Fornecedor: {item.fornecedor?.pessoa_nome || 'N/A'}</Text>
        <Text style={promotionListStyles.itemSubText}>Início: {new Date(item.inicio).toLocaleDateString()}</Text>
        {item.fim && <Text style={promotionListStyles.itemSubText}>Fim: {new Date(item.fim).toLocaleDateString()}</Text>}
        <Text style={item.ativo ? promotionListStyles.statusActive : promotionListStyles.statusInactive}>
            Status: {item.ativo ? 'Ativa' : 'Inativa'}
        </Text>
    </View>
    <View style={promotionListStyles.listItemButtons}>
        <TouchableOpacity onPress={() => onEdit(item)} style={[promotionListStyles.button, promotionListStyles.editButton]}>
             <Ionicons name="pencil-outline" size={18} color="white" />
        </TouchableOpacity>
        {/* Botão para desativar ou reativar */}
        <TouchableOpacity onPress={() => onDelete(item)} style={[promotionListStyles.button, item.ativo ? promotionListStyles.deleteButton : promotionListStyles.activateButton]}>
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
        return <ActivityIndicator size="large" color="#007bff" style={promotionListStyles.centered} />;
    }
    if (error) {
        return (
            <View style={promotionListStyles.centered}>
                <Text style={promotionListStyles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => fetchPromocoesAdmin()} style={promotionListStyles.retryButton}>
                    <Text style={promotionListStyles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }
    if (promocoes.length === 0 && !loading) { // Se não está carregando e não tem promoções
        return (
             <View style={promotionListStyles.centered}>
                <Text style={promotionListStyles.emptyText}>Nenhuma promoção encontrada.</Text>
                <Text style={promotionListStyles.emptySubText}>(Pull-to-refresh para atualizar)</Text>
            </View>
        );
    }
    // Se chegou aqui, tem promoções para listar
    return (
      <FlatList
        data={promocoes}
        keyExtractor={(item) => item.promocao_id.toString()}
        renderItem={({ item }) => (
          <PromotionListItem item={item} onEdit={handleEdit} onDelete={handleDeleteToggle} />
        )}
        contentContainerStyle={promotionListStyles.list}
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
    <View style={promotionListStyles.container}>
       <TouchableOpacity
         style={[promotionListStyles.button, promotionListStyles.addButton]}
         onPress={() => navigation.navigate('PromocaoForm')} // Modo criação
       >
         <Ionicons name="add-circle-outline" size={22} color="white" style={{marginRight: 8}}/>
         <Text style={promotionListStyles.buttonText}>Nova Promoção</Text>
       </TouchableOpacity>
      {renderContent()} {/* Chama a função aqui */}
       {/* Overlay de Loading para ações como delete/update (opcional, já incluído no loading geral) */}
       {/* {loading && !refreshing && promocoes.length > 0 && <View style={promotionListStyles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>} */}
    </View>
  );
};

export default PromocaoListScreen;