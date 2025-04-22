import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import marcaService from '../../services/marcaService'; // Serviço de marca
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  <View style={styles.listItem}>
    <View style={styles.listItemText}>
        <Text style={styles.itemText}>{item.marca_id} - {item.marca_nome}</Text>
    </View>
    <View style={styles.listItemButtons}>
        <TouchableOpacity onPress={() => onEdit(item)} style={[styles.button, styles.editButton]}>
            <Text style={styles.buttonTextSmall}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)} style={[styles.button, styles.deleteButton]}>
             <Text style={styles.buttonTextSmall}>Excluir</Text>
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
      return <ActivityIndicator size="large" color="#0066cc" style={styles.centered}/>;
    }
    if (error) {
      return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
    }
     if (marcas.length === 0 && !loading) {
         return <Text style={styles.centered}>Nenhuma marca encontrada.</Text>;
     }

    return (
      <FlatList
        data={marcas}
        keyExtractor={(item) => item.marca_id.toString()}
        renderItem={({ item }) => (
          <MarcaListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#0066cc"]}/>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
       <TouchableOpacity
         style={[styles.button, styles.addButton]}
         onPress={() => navigation.navigate('MarcaForm')} // Modo criação
       >
         <Text style={styles.buttonText}>Adicionar Nova Marca</Text>
       </TouchableOpacity>
      {renderContent()}
       {loading && !refreshing && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
    </View>
  );
};

// Estilos (Copie/adapte os estilos de CategoriaListScreen ou EstadoListScreen)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    list: { padding: 10, },
    listItem: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
    listItemText: { flex: 1, marginRight: 10 },
    listItemButtons: { flexDirection: 'row' },
    itemText: { fontSize: 16 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 20 },
    errorText: { color: 'red', fontSize: 16 },
    button: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, marginLeft: 5, justifyContent: 'center', alignItems: 'center' },
    editButton: { backgroundColor: '#ffc107' },
    deleteButton: { backgroundColor: '#dc3545' },
    addButton: { backgroundColor: '#28a745', margin: 10, padding: 15, alignSelf: 'stretch', alignItems: 'center' }, // Stretch button
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    buttonTextSmall: { color: 'white', fontSize: 12 },
    loadingOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }
});

export default MarcaListScreen;