import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import tipoService from '../../services/tipoService'; // Serviço de tipo
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  <View style={styles.listItem}>
    <View style={styles.listItemText}>
        <Text style={styles.itemText}>{item.tipo_id} - {item.tipo_nome}</Text>
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
    if (loading && !refreshing) { return <ActivityIndicator size="large" color="#0066cc" style={styles.centered}/>; }
    if (error) { return <Text style={[styles.centered, styles.errorText]}>{error}</Text>; }
    if (tipos.length === 0 && !loading) { return <Text style={styles.centered}>Nenhum tipo encontrado.</Text>; }

    return (
      <FlatList
        data={tipos}
        keyExtractor={(item) => item.tipo_id.toString()}
        renderItem={({ item }) => (
          <TipoListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#0066cc"]}/>}
      />
    );
  };

  return (
    <View style={styles.container}>
       <TouchableOpacity
         style={[styles.button, styles.addButton]}
         onPress={() => navigation.navigate('TipoForm')} // Modo criação
       >
         <Text style={styles.buttonText}>Adicionar Novo Tipo</Text>
       </TouchableOpacity>
      {renderContent()}
       {loading && !refreshing && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
    </View>
  );
};

// Estilos (Copie/adapte de Categoria/MarcaListScreen)
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
    addButton: { backgroundColor: '#28a745', margin: 10, padding: 15, alignSelf: 'stretch', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    buttonTextSmall: { color: 'white', fontSize: 12 },
    loadingOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }
});


export default TipoListScreen;