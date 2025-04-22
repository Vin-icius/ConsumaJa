import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import locationService from '../../services/locationService';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

// Componente Item da Lista (Pode mover para /components)
const CidadeListItem = ({ item, onEdit, onDelete }) => (
  <View style={styles.listItem}>
    <View style={styles.listItemText}>
      {/* Idealmente, mostrar o nome/sigla do estado também. A API /cidades precisa retornar isso ou fazer outra busca */}
      <Text style={styles.itemText}>{item.cidade_id} - {item.cidade_nome}</Text>
      <Text style={styles.itemSubText}>DDD: {item.regiao_ddd} (Estado ID: {item.estado_id})</Text>
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

const CidadeListScreen = ({ navigation }) => {
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [estados, setEstados] = useState([]);
  const [selectedEstadoId, setSelectedEstadoId] = useState(null);

  const fetchCidades = async () => {
    setLoading(true);
    setError(null);
    try {
      // Busca todas as cidades por enquanto. Poderia filtrar por selectedEstadoId se implementado.
      const response = await locationService.getCidades();
      setCidades(response.data || []);
    } catch (err) {
      console.error("Erro ao buscar cidades:", err);
      setError("Não foi possível carregar as cidades.");
      setCidades([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEstadosParaFiltro = async () => {
      try {
          const response = await locationService.getEstados();
          setEstados(response.data || []);
      } catch (err) {
          console.error("Erro ao buscar estados para filtro:", err);
          // Lidar com erro silenciosamente ou mostrar alerta
      }
  };

  // Carrega cidades quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      fetchCidades();
      fetchEstadosParaFiltro();
    }, []) // Dependências vazias para rodar só uma vez ao focar
  );

  const handleRefresh = () => {
      setRefreshing(true);
      fetchCidades();
  };

  const handleEdit = (cidade) => {
    navigation.navigate('CidadeForm', { cidadeParaEditar: cidade });
  };

  const handleDelete = (cidade) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a cidade "${cidade.cidade_nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            try {
                 setLoading(true);
                 await locationService.deleteCidade(cidade.cidade_id);
                 Alert.alert("Sucesso", "Cidade excluída com sucesso!");
                 fetchCidades(); // Recarrega a lista
            } catch (err) {
                 console.error("Erro ao excluir cidade:", err);
                 const message = err.response?.data?.message || "Não foi possível excluir a cidade.";
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
     if (cidades.length === 0 && !loading) {
         return <Text style={styles.centered}>Nenhuma cidade encontrada.</Text>;
     }

    return (
      <FlatList
        data={cidades}
        keyExtractor={(item) => item.cidade_id.toString()}
        renderItem={({ item }) => (
          <CidadeListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
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
       {
       <View style={styles.pickerContainer}>
           <Picker
               selectedValue={selectedEstadoId}
               onValueChange={(itemValue, itemIndex) => setSelectedEstadoId(itemValue)}
               style={styles.picker}
               prompt="Filtrar por Estado"
           >
               <Picker.Item label="Todos os Estados" value={null} />
               {estados.map(estado => (
                   <Picker.Item key={estado.estado_id} label={`${estado.estado_nome} (${estado.estado_sigla})`} value={estado.estado_id} />
               ))}
           </Picker>
       </View>
       }
       <TouchableOpacity
         style={[styles.button, styles.addButton]}
         onPress={() => navigation.navigate('CidadeForm')} // Modo criação
       >
         <Text style={styles.buttonText}>Adicionar Nova Cidade</Text>
       </TouchableOpacity>
      {renderContent()}
       {loading && refreshing && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
    </View>
  );
};

// --- Estilos --- (Similares aos de EstadoListScreen, ajuste se necessário)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    list: { padding: 10, },
    listItem: {
      backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 5,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2, shadowRadius: 1.41,
    },
    listItemText: { flex: 1, marginRight: 10 },
    listItemButtons: { flexDirection: 'row' },
    itemText: { fontSize: 16, fontWeight: 'bold' },
    itemSubText: { fontSize: 13, color: 'grey' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 20 },
    errorText: { color: 'red', fontSize: 16 },
    button: {
         paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, marginLeft: 5,
         justifyContent: 'center', alignItems: 'center',
     },
     editButton: { backgroundColor: '#ffc107' },
     deleteButton: { backgroundColor: '#dc3545' },
     addButton: { backgroundColor: '#28a745', margin: 10, padding: 15 },
     buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
     buttonTextSmall: { color: 'white', fontSize: 12 },
     loadingOverlay: {
         position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
         alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)'
     },
     // Estilos para o Picker de filtro (opcional)
     pickerContainer: {
         marginHorizontal: 10,
         marginTop: 10,
         backgroundColor: 'white',
         borderRadius: 5,
         borderWidth: 1,
         borderColor: '#ccc',
     },
     picker: {
         height: 50,
     },
});


export default CidadeListScreen;