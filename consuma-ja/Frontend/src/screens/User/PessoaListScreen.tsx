import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import pessoaService from '../../services/pessoaService';
import { Ionicons } from '@expo/vector-icons'; // Para ícones

// Definir tipo para Pessoa (simplificado para lista)
interface PessoaItem {
    pessoa_id: number;
    pessoa_nome: string;
    pessoa_email: string;
    pessoa_tipo: string;
    ativo: boolean; // Mapeado de pessoa_status
}

// Componente Item da Lista
const PessoaListItem = ({ item, onEdit, onDelete }: { item: PessoaItem, onEdit: (item: PessoaItem) => void, onDelete: (item: PessoaItem) => void }) => (
  <View style={[styles.listItem, !item.ativo ? styles.listItemInactive : null]}>
    <View style={styles.listItemText}>
        <Text style={styles.itemTextTitle}>{item.pessoa_id} - {item.pessoa_nome}</Text>
        <Text style={styles.itemSubText}>Email: {item.pessoa_email}</Text>
        <Text style={styles.itemSubText}>Tipo: {item.pessoa_tipo} {item.ativo ? '' : '- INATIVO'}</Text>
    </View>
    <View style={styles.listItemButtons}>
        <TouchableOpacity onPress={() => onEdit(item)} style={[styles.button, styles.editButton]}>
             <Ionicons name="pencil-outline" size={18} color="white" />
        </TouchableOpacity>
        {/* Só mostra botão de excluir se estiver ativo */}
        {item.ativo && (
             <TouchableOpacity onPress={() => onDelete(item)} style={[styles.button, styles.deleteButton]}>
                 <Ionicons name="trash-outline" size={18} color="white" />
             </TouchableOpacity>
        )}
    </View>
  </View>
);

const PessoaListScreen = () => {
  const navigation = useNavigation<any>();
  const [pessoas, setPessoas] = useState<PessoaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPessoas = async () => {
    if (!refreshing) setLoading(true); setError(null);
    try {
      const data = await pessoaService.listarPessoas(); // Lista ativos por padrão
      setPessoas(data || []);
    } catch (err) { console.error("Erro buscar pessoas:", err); setError("Erro ao carregar usuários."); setPessoas([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchPessoas(); }, []));
  const handleRefresh = () => { setRefreshing(true); fetchPessoas(); };

  const handleEdit = (pessoa: PessoaItem) => {
    navigation.navigate('PessoaForm', { pessoaId: pessoa.pessoa_id });
  };

  const handleDelete = (pessoa: PessoaItem) => {
    Alert.alert( "Confirmar Exclusão", `Desativar o usuário "${pessoa.pessoa_nome}"?`,
      [ { text: "Cancelar", style: "cancel" }, { text: "Confirmar", style: "destructive", onPress: async () => {
            setLoading(true);
            try { await pessoaService.excluirPessoa(pessoa.pessoa_id); Alert.alert("Sucesso", "Usuário desativado."); fetchPessoas(); }
            catch (err: any) { const msg = err.response?.data?.message || err.message || "Erro."; Alert.alert("Erro", msg); }
            finally { setLoading(false); }
          }
        }
      ]
    );
  };

   const renderContent = () => {
        if (loading && !refreshing) return <ActivityIndicator size="large" style={styles.centered}/>;
        if (error) return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
        if (pessoas.length === 0 && !loading) return <Text style={styles.centered}>Nenhuma pessoa encontrada.</Text>;
        return ( <FlatList data={pessoas} keyExtractor={(item) => item.pessoa_id.toString()} renderItem={({ item }) => ( <PessoaListItem item={item} onEdit={handleEdit} onDelete={handleDelete} /> )} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>} /> );
   };

  return (
    <View style={styles.container}>
      {/* Botão Adicionar (se admin puder criar outros usuários) */}
       {/* <TouchableOpacity style={[styles.button, styles.addButton]} onPress={() => navigation.navigate('PessoaForm')}>
         <Text style={styles.buttonText}>Adicionar Pessoa</Text>
       </TouchableOpacity> */}
       {renderContent()}
       {loading && !refreshing && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
    </View>
  );
};

// Estilos (Baseados nos outros ListScreen)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    list: { padding: 10, },
    listItem: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    listItemInactive: { backgroundColor: '#e9ecef', opacity: 0.6 },
    listItemText: { flex: 1, marginRight: 10 },
    listItemButtons: { flexDirection: 'row' },
    itemTextTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
    itemSubText: { fontSize: 13, color: 'grey' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 20 },
    errorText: { color: 'red', fontSize: 16 },
    button: { padding: 10, borderRadius: 20, marginLeft: 8, justifyContent: 'center', alignItems: 'center', width: 40, height: 40 }, // Botões redondos
    editButton: { backgroundColor: '#ffc107' },
    deleteButton: { backgroundColor: '#dc3545' },
    addButton: { backgroundColor: '#28a745', margin: 10, padding: 15, alignSelf: 'stretch', alignItems: 'center', borderRadius: 8 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    buttonTextSmall: { color: 'white', fontSize: 12 },
    loadingOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }
});

export default PessoaListScreen;