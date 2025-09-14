// src/screens/Promotions/PromocaoListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import promocaoService from '../../services/promocaoService';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { promotionListStyles } from '../../common/styles/Promotions/promotionListScreen.styled';
import PromotionTable from '../../components/Promotions/PromotionTable';
import { usePromotion } from '../../contexts/PromotionContext/promotionContext';

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

const PromocaoListScreen = () => {
  const navigation = useNavigation<any>(); // Use o tipo correto se definido
  const { searchQuery, setSearchQuery, selectedFilters, setSelectedFilters } = usePromotion();
  const [promocoes, setPromocoes] = useState<PromocaoAdminItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPromocoesAdmin = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (searchQuery.trim()) {
        params.searchTerm = searchQuery.trim();
      }
      if (selectedFilters.includes('ativo')) {
        params.ativo = true;
      } else if (selectedFilters.includes('inativo')) {
        params.ativo = false;
      }
      // No backend, o service/repo de promoção já deve tratar o filtro 'TODAS'
      // e buscar o nome do fornecedor via JOIN
      const data = await promocaoService.listarPromocoes(params); // Exemplo para buscar todas
      setPromocoes(data || []);
    } catch (err: any) {
      console.error("Erro buscar promoções admin (Tela):", err.response?.data || err.message || err);
      setError("Erro ao carregar promoções.");
      setPromocoes([]);
    } finally {
      if (!isRefreshing) setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedFilters]);

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

  // Função para renderizar o conteúdo
  const renderContent = () => {
    if (loading && !refreshing && promocoes.length === 0) {
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
    return (
      <PromotionTable
        promocoes={promocoes}
        onEdit={handleEdit}
        onDelete={handleDeleteToggle}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    );
  };

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
    </View>
  );
};

export default PromocaoListScreen;