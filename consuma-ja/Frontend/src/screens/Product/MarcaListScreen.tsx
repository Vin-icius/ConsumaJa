import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import marcaService from '../../services/marcaService'; // Serviço de marca
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { marcaListStyles } from '../../common/styles/Product/marcaListScreen.styled';

// Definir tipo para o item Marca
interface MarcaItem {
    marca_id: number;
    marca_nome: string;
    ativo: boolean;
}

// Tipagem da Navegação (opcional)
// type ProductStackParamList = {
//   MarcaList: undefined;
//   MarcaForm: { marcaParaEditar?: MarcaItem };
//   // ... outras rotas
// };
// type MarcaListNavigationProp = NativeStackNavigationProp<ProductStackParamList, 'MarcaList'>;


// Componente Item da Lista
const MarcaListItem = ({ item, onEdit, onDelete }: { item: MarcaItem, onEdit: (item: MarcaItem) => void, onDelete: (item: MarcaItem) => void }) => (
  <View style={marcaListStyles.listItem}>
    <View style={marcaListStyles.listItemText}>
        <Text style={marcaListStyles.itemText}>{item.marca_id} - {item.marca_nome}</Text>
    </View>
    <View style={marcaListStyles.listItemButtons}>
        <TouchableOpacity onPress={() => onEdit(item)} style={[marcaListStyles.button, marcaListStyles.editButton]}>
            <Text style={marcaListStyles.buttonTextSmall}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)} style={[marcaListStyles.button, marcaListStyles.deleteButton]}>
             <Text style={marcaListStyles.buttonTextSmall}>Excluir</Text>
        </TouchableOpacity>
    </View>
  </View>
);

const MarcaListScreen = () => {
  const navigation = useNavigation<any>(); // Usar tipo correto se definido: MarcaListNavigationProp

  const [marcas, setMarcas] = useState<MarcaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMarcas = async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      // Service retorna array vazio em caso de erro
      const data = await marcaService.listarMarcas();
      setMarcas(data || []);
    } catch (err) {
      console.error("Erro ao buscar marcas (Tela):", err);
      setError("Não foi possível carregar as marcas.");
      setMarcas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMarcas();
    }, [])
  );

  const handleRefresh = () => {
      setRefreshing(true);
      fetchMarcas();
  };

  const handleEdit = (marca: MarcaItem) => {
    navigation.navigate('MarcaForm', { marcaParaEditar: marca });
  };

  const handleDelete = (marca: MarcaItem) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir (desativar) a marca "${marca.marca_nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            setLoading(true);
            try {
                 await marcaService.excluirMarca(marca.marca_id);
                 Alert.alert("Sucesso", "Marca desativada com sucesso!");
                 fetchMarcas();
            } catch (err: any) {
                 console.error("Erro ao excluir marca:", err);
                 const message = err.response?.data?.message || err.message || "Não foi possível excluir a marca.";
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
    if (loading && !refreshing) {
      return <ActivityIndicator size="large" color="#0066cc" style={marcaListStyles.centered}/>;
    }
    if (error) {
      return <Text style={[marcaListStyles.centered, marcaListStyles.errorText]}>{error}</Text>;
    }
     if (marcas.length === 0 && !loading) {
         return <Text style={marcaListStyles.centered}>Nenhuma marca encontrada.</Text>;
     }

    return (
      <FlatList
        data={marcas}
        keyExtractor={(item) => item.marca_id.toString()}
        renderItem={({ item }) => (
          <MarcaListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={marcaListStyles.list}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#0066cc"]}/>
        }
      />
    );
  };

  return (
    <View style={marcaListStyles.container}>
       <TouchableOpacity
         style={[marcaListStyles.button, marcaListStyles.addButton]}
         onPress={() => navigation.navigate('MarcaForm')} // Modo criação
       >
         <Text style={marcaListStyles.buttonText}>Adicionar Nova Marca</Text>
       </TouchableOpacity>
      {renderContent()}
       {loading && !refreshing && <View style={marcaListStyles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
    </View>
  );
};

export default MarcaListScreen;