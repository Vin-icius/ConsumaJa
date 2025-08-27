import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Stylesheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import locationService from '../../services/locationService';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { cityListStyles } from '../../common/styles/Location/cityListScreen.styled';

// Componente Item da Lista (Pode mover para /components)
const CidadeListItem = ({ item, onEdit, onDelete }) => (
  <View style={cityListStyles.listItem}>
    <View style={cityListStyles.listItemText}>
      {/* Idealmente, mostrar o nome/sigla do estado também. A API /cidades precisa retornar isso ou fazer outra busca */}
      <Text style={cityListStyles.itemText}>{item.cidade_id} - {item.cidade_nome}</Text>
      <Text style={cityListStyles.itemSubText}>DDD: {item.regiao_ddd} (Estado ID: {item.estado_id})</Text>
    </View>
    <View style={cityListStyles.listItemButtons}>
      <TouchableOpacity onPress={() => onEdit(item)} style={[cityListStyles.button, cityListStyles.editButton]}>
        <Text style={cityListStyles.buttonTextSmall}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(item)} style={[cityListStyles.button, cityListStyles.deleteButton]}>
        <Text style={cityListStyles.buttonTextSmall}>Excluir</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const CityListScreen = ({ navigation }) => {
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
      return <ActivityIndicator size="large" color="#0066cc" style={cityListStyles.centered}/>;
    }
    if (error) {
      return <Text style={[cityListStyles.centered, cityListStyles.errorText]}>{error}</Text>;
    }
     if (cidades.length === 0 && !loading) {
         return <Text style={cityListStyles.centered}>Nenhuma cidade encontrada.</Text>;
     }

    return (
      <FlatList
        data={cidades}
        keyExtractor={(item) => item.cidade_id.toString()}
        renderItem={({ item }) => (
          <CidadeListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={cityListStyles.list}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#0066cc"]}/>
        }
      />
    );
  };

  return (
    <View style={cityListStyles.container}>
       {
       <View style={cityListStyles.pickerContainer}>
           <Picker
               selectedValue={selectedEstadoId}
               onValueChange={(itemValue, itemIndex) => setSelectedEstadoId(itemValue)}
               style={cityListStyles.picker}
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
         style={[cityListStyles.button, cityListStyles.addButton]}
         onPress={() => navigation.navigate('CidadeForm')} // Modo criação
       >
         <Text style={cityListStyles.buttonText}>Adicionar Nova Cidade</Text>
       </TouchableOpacity>
      {renderContent()}
       {loading && refreshing && <View style={cityListStyles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
    </View>
  );
};

export default CityListScreen;