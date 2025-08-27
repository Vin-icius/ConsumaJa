import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // Importar hooks
import categoriaService from '../../services/categoriaService'; // Serviço de categoria
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Tipagem (opcional)
import { categoriaListStyles } from '../../common/styles/Product/categoriaListScreen.styled';

// Definir tipo para o item Categoria (espelhar backend)
interface CategoriaItem {
    categoria_id: number;
    categoria_nome: string;
    ativo: boolean;
}

// Definir tipos para a pilha de navegação se estiver usando TS nela
// type ProductStackParamList = {
//   CategoriaList: undefined;
//   CategoriaForm: { categoriaParaEditar?: CategoriaItem };
//   // ... outras rotas de produto
// };
// type CategoriaListNavigationProp = NativeStackNavigationProp<ProductStackParamList, 'CategoriaList'>;


// Componente Item da Lista (pode mover para /components)
const CategoriaListItem = ({ item, onEdit, onDelete }: { item: CategoriaItem, onEdit: (item: CategoriaItem) => void, onDelete: (item: CategoriaItem) => void }) => (
  <View style={categoriaListStyles.listItem}>
    <View style={categoriaListStyles.listItemText}>
        <Text style={categoriaListStyles.itemText}>{item.categoria_id} - {item.categoria_nome}</Text>
    </View>
    <View style={categoriaListStyles.listItemButtons}>
        <TouchableOpacity onPress={() => onEdit(item)} style={[categoriaListStyles.button, categoriaListStyles.editButton]}>
            <Text style={categoriaListStyles.buttonTextSmall}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)} style={[categoriaListStyles.button, categoriaListStyles.deleteButton]}>
             <Text style={categoriaListStyles.buttonTextSmall}>Excluir</Text>
        </TouchableOpacity>
    </View>
  </View>
);

const CategoriaListScreen = () => {
  // Usar hook de navegação
  const navigation = useNavigation<any>(); // Use o tipo correto se tiver: CategoriaListNavigationProp

  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategorias = async () => {
    // Não inicia loading se já estiver fazendo refresh
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      // Service já retorna array vazio em caso de erro de rede/axios
      const data = await categoriaService.listarCategorias(); // Lista apenas ativos por padrão
      setCategorias(data || []);
    } catch (err) {
      // Captura erros lançados pelo service (ex: se foi configurado para lançar)
      console.error("Erro ao buscar categorias (Tela):", err);
      setError("Não foi possível carregar as categorias.");
      setCategorias([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Hook para carregar/recarregar dados quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      fetchCategorias();
    }, [])
  );

  const handleRefresh = () => {
      setRefreshing(true);
      fetchCategorias();
  };

  const handleEdit = (categoria: CategoriaItem) => {
    // Navega para form passando dados para edição
    navigation.navigate('CategoriaForm', { categoriaParaEditar: categoria });
  };

  const handleDelete = (categoria: CategoriaItem) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir (desativar) a categoria "${categoria.categoria_nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            setLoading(true); // Mostra loading overlay
            try {
                 await categoriaService.excluirCategoria(categoria.categoria_id);
                 Alert.alert("Sucesso", "Categoria desativada com sucesso!");
                 fetchCategorias(); // Recarrega a lista
            } catch (err: any) {
                 console.error("Erro ao excluir categoria:", err);
                 const message = err.response?.data?.message || err.message || "Não foi possível excluir a categoria.";
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
    // Mostra ActivityIndicator só no load inicial ou delete
    if (loading && !refreshing) {
      return <ActivityIndicator size="large" color="#0066cc" style={categoriaListStyles.centered}/>;
    }
    if (error) {
      return <Text style={[categoriaListStyles.centered, categoriaListStyles.errorText]}>{error}</Text>;
    }
     if (categorias.length === 0 && !loading) {
         return <Text style={categoriaListStyles.centered}>Nenhuma categoria encontrada.</Text>;
     }

    return (
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.categoria_id.toString()}
        renderItem={({ item }) => (
          <CategoriaListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={categoriaListStyles.list}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#0066cc"]}/>
        }
      />
    );
  };

  return (
    <View style={categoriaListStyles.container}>
       <TouchableOpacity
         style={[categoriaListStyles.button, categoriaListStyles.addButton]}
         onPress={() => navigation.navigate('CategoriaForm')} // Navega para form em modo criação
       >
         <Text style={categoriaListStyles.buttonText}>Adicionar Nova Categoria</Text>
       </TouchableOpacity>
      {renderContent()}
       {/* Overlay de Loading para Delete/Update */}
       {loading && !refreshing && <View style={categoriaListStyles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
    </View>
  );
};

export default CategoriaListScreen;