import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import tipoService from '../../services/tipoService'; // Serviço de tipo
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { tipoListStyles } from '../../common/styles/Product/tipoListScreen.styled';

// Definir tipo para o item Tipo
interface TipoItem {
    tipo_id: number;
    tipo_nome: string;
    ativo: boolean;
}

// Tipagem da Navegação (opcional)
// type ProductStackParamList = {
//   TipoList: undefined;
//   TipoForm: { tipoParaEditar?: TipoItem };
//   // ... outras rotas
// };
// type TipoListNavigationProp = NativeStackNavigationProp<ProductStackParamList, 'TipoList'>;


// Componente Item da Lista
const TipoListItem = ({ item, onEdit, onDelete }: { item: TipoItem, onEdit: (item: TipoItem) => void, onDelete: (item: TipoItem) => void }) => (
  <View style={tipoListStyles.listItem}>
    <View style={tipoListStyles.listItemText}>
        <Text style={tipoListStyles.itemText}>{item.tipo_id} - {item.tipo_nome}</Text>
    </View>
    <View style={tipoListStyles.listItemButtons}>
        <TouchableOpacity onPress={() => onEdit(item)} style={[tipoListStyles.button, tipoListStyles.editButton]}>
            <Text style={tipoListStyles.buttonTextSmall}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)} style={[tipoListStyles.button, tipoListStyles.deleteButton]}>
             <Text style={tipoListStyles.buttonTextSmall}>Excluir</Text>
        </TouchableOpacity>
    </View>
  </View>
);

const TipoListScreen = () => {
  const navigation = useNavigation<any>(); // Usar tipo correto se definido

  const [tipos, setTipos] = useState<TipoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTipos = async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      const data = await tipoService.listarTipos(); // Lista apenas ativos
      setTipos(data || []);
    } catch (err) {
      console.error("Erro ao buscar tipos (Tela):", err);
      setError("Não foi possível carregar os tipos.");
      setTipos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTipos(); }, []));

  const handleRefresh = () => { setRefreshing(true); fetchTipos(); };

  const handleEdit = (tipo: TipoItem) => {
    navigation.navigate('TipoForm', { tipoParaEditar: tipo });
  };

  const handleDelete = (tipo: TipoItem) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir (desativar) o tipo "${tipo.tipo_nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            setLoading(true);
            try {
                 await tipoService.excluirTipo(tipo.tipo_id);
                 Alert.alert("Sucesso", "Tipo desativado com sucesso!");
                 fetchTipos(); // Recarrega
            } catch (err: any) {
                 console.error("Erro ao excluir tipo:", err);
                 const message = err.response?.data?.message || err.message || "Não foi possível excluir o tipo.";
                 Alert.alert("Erro", message);
            } finally {
                 setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderContent = () => {
    if (loading && !refreshing) { return <ActivityIndicator size="large" color="#0066cc" style={tipoListStyles.centered}/>; }
    if (error) { return <Text style={[tipoListStyles.centered, tipoListStyles.errorText]}>{error}</Text>; }
    if (tipos.length === 0 && !loading) { return <Text style={tipoListStyles.centered}>Nenhum tipo encontrado.</Text>; }

    return (
      <FlatList
        data={tipos}
        keyExtractor={(item) => item.tipo_id.toString()}
        renderItem={({ item }) => (
          <TipoListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={tipoListStyles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#0066cc"]}/>}
      />
    );
  };

  return (
    <View style={tipoListStyles.container}>
       <TouchableOpacity
         style={[tipoListStyles.button, tipoListStyles.addButton]}
         onPress={() => navigation.navigate('TipoForm')} // Modo criação
       >
         <Text style={tipoListStyles.buttonText}>Adicionar Novo Tipo</Text>
       </TouchableOpacity>
      {renderContent()}
       {loading && !refreshing && <View style={tipoListStyles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
    </View>
  );
};

export default TipoListScreen;