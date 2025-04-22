import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import locationService from '../../services/locationService'; // Importa o serviço
import { useFocusEffect } from '@react-navigation/native'; // Para recarregar ao voltar

// Componente simples para o item da lista (poderia estar em src/components/Location/EstadoListItem.js)
const EstadoListItem = ({ item, onEdit, onDelete }) => (
  <View style={styles.listItem}>
    <View style={styles.listItemText}>
        <Text style={styles.itemText}>{item.estado_id} - {item.estado_nome} ({item.estado_sigla})</Text>
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

const EstadoListScreen = ({ navigation }) => {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEstados = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await locationService.getEstados();
      setEstados(response.data || []); // Garante que seja um array
    } catch (err) {
      console.error("Erro ao buscar estados:", err);
      setError("Não foi possível carregar os estados.");
      setEstados([]); // Limpa em caso de erro
    } finally {
      setLoading(false);
      setRefreshing(false); // Termina o refresh do pull-to-refresh
    }
  };

  // Hook para carregar dados quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      fetchEstados();
    }, [])
  );

  const handleRefresh = () => {
      setRefreshing(true); // Ativa indicador do pull-to-refresh
      fetchEstados();
  };

  const handleEdit = (estado) => {
    // Navega para a tela de formulário passando o estado para edição
    navigation.navigate('EstadoForm', { estadoParaEditar: estado });
  };

  const handleDelete = (estado) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir o estado "${estado.estado_nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            try {
                 setLoading(true); // Mostrar indicador durante a exclusão
                 await locationService.deleteEstado(estado.estado_id);
                 Alert.alert("Sucesso", "Estado excluído com sucesso!");
                 fetchEstados(); // Recarrega a lista
            } catch (err) {
                 console.error("Erro ao excluir estado:", err);
                 // Tenta pegar mensagem do AppError do backend
                 const message = err.response?.data?.message || "Não foi possível excluir o estado.";
                 Alert.alert("Erro", message);
                 setLoading(false); // Esconde indicador se deu erro
            }
          }
        }
      ]
    );
  };

  const renderContent = () => {
    if (loading && !refreshing) { // Mostra ActivityIndicator só no load inicial
      return <ActivityIndicator size="large" color="#0066cc" style={styles.centered}/>;
    }
    if (error) {
      return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
    }
     if (estados.length === 0 && !loading) {
         return <Text style={styles.centered}>Nenhum estado encontrado.</Text>;
     }

    return (
      <FlatList
        data={estados}
        keyExtractor={(item) => item.estado_id.toString()}
        renderItem={({ item }) => (
          <EstadoListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.list}
        // Pull to refresh
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
         onPress={() => navigation.navigate('EstadoForm')} // Navega para form sem passar dados (modo criação)
       >
         <Text style={styles.buttonText}>Adicionar Novo Estado</Text>
       </TouchableOpacity>
      {renderContent()}
       {/* Overlay de Loading para Delete */}
       {loading && refreshing && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
    </View>
  );
};

// --- Estilos --- (Adapte conforme necessário)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  list: { padding: 10, },
  listItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2, // Sombra Android
     shadowColor: '#000', // Sombra iOS
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.2,
     shadowRadius: 1.41,
  },
   listItemText: {
       flex: 1, // Ocupa espaço disponível
       marginRight: 10,
   },
   listItemButtons: {
       flexDirection: 'row',
   },
  itemText: { fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center' },
  errorText: { color: 'red', fontSize: 16 },
   button: {
       paddingVertical: 8,
       paddingHorizontal: 12,
       borderRadius: 5,
       marginLeft: 5,
       justifyContent: 'center',
       alignItems: 'center',
   },
   editButton: { backgroundColor: '#ffc107' }, // Amarelo
   deleteButton: { backgroundColor: '#dc3545' }, // Vermelho
   addButton: { backgroundColor: '#28a745', margin: 10, padding: 15 }, // Verde
   buttonText: { color: 'white', fontSize: 16 },
   buttonTextSmall: { color: 'white', fontSize: 12 },
   loadingOverlay: { // Para loading durante delete
       position: 'absolute',
       left: 0,
       right: 0,
       top: 0,
       bottom: 0,
       alignItems: 'center',
       justifyContent: 'center',
       backgroundColor: 'rgba(0,0,0,0.3)'
   }
});

export default EstadoListScreen;