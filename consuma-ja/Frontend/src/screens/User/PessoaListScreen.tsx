import React, { useState, useCallback, useMemo } from 'react'; // Adicione useMemo
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Importe o Picker
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import pessoaService from '../../services/pessoaService';
import { Ionicons } from '@expo/vector-icons';

// Definir tipo para Pessoa (simplificado para lista)
interface PessoaItem {
    pessoa_id: number;
    pessoa_nome: string;
    pessoa_email: string;
    pessoa_tipo: string; // Admin, Fisica, Juridica
    ativo: boolean; // Mapeado de pessoa_status
}

// Componente Item da Lista (sem alterações)
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

  // --- Estados para os filtros ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Qualquer'); // Valor inicial

  const fetchPessoas = async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      // Busca a lista completa (ou a lógica que você tiver no service)
      const data = await pessoaService.listarPessoas(); // Lista ativos por padrão
      setPessoas(data || []);
    } catch (err) {
      console.error("Erro buscar pessoas:", err);
      setError("Erro ao carregar usuários.");
      setPessoas([]); // Limpa em caso de erro
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Buscar dados quando a tela recebe foco
  useFocusEffect(useCallback(() => {
      fetchPessoas();
  }, []));

  // Função de refresh
  const handleRefresh = () => {
      setRefreshing(true);
      // Limpa filtros ao dar refresh? Opcional. Mantendo os filtros:
      // setSearchTerm('');
      // setSelectedType('Qualquer');
      fetchPessoas();
  };

  // Navegação para edição
  const handleEdit = (pessoa: PessoaItem) => {
    navigation.navigate('PessoaForm', { pessoaId: pessoa.pessoa_id });
  };

  // Lógica de exclusão (desativação)
  const handleDelete = (pessoa: PessoaItem) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Desativar o usuário "${pessoa.pessoa_nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", style: "destructive", onPress: async () => {
            setLoading(true);
            try {
              await pessoaService.excluirPessoa(pessoa.pessoa_id);
              Alert.alert("Sucesso", "Usuário desativado.");
              fetchPessoas(); // Recarrega a lista
            } catch (err: any) {
              const msg = err.response?.data?.message || err.message || "Erro ao desativar.";
              Alert.alert("Erro", msg);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // --- Filtragem dos dados ---
  const filteredPessoas = useMemo(() => {
    let tempList = pessoas;

    // 1. Filtrar por tipo (se não for 'Qualquer')
    if (selectedType !== 'Qualquer') {
      tempList = tempList.filter(p => p.pessoa_tipo === selectedType);
    }

    // 2. Filtrar por termo de busca (nome ou email, case-insensitive)
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempList = tempList.filter(p =>
        p.pessoa_nome.toLowerCase().includes(lowerSearchTerm) ||
        p.pessoa_email.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return tempList;
  }, [pessoas, searchTerm, selectedType]); // Recalcula quando estas dependências mudam

  // --- Renderização do conteúdo (lista, loading, erro) ---
  const renderContent = () => {
    // Mostra loading inicial
    if (loading && !refreshing && !pessoas.length) return <ActivityIndicator size="large" style={styles.centered}/>;

    // Mostra erro
    if (error) return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;

    // Mostra mensagem se a lista FILTRADA estiver vazia
    if (filteredPessoas.length === 0) {
        // Se a lista original também estava vazia (e não está carregando)
        if(pessoas.length === 0 && !loading) {
            return <Text style={styles.centered}>Nenhuma pessoa encontrada.</Text>;
        }
        // Se a lista original tinha itens, mas os filtros não retornaram nada
        return <Text style={styles.centered}>Nenhum usuário encontrado com os filtros aplicados.</Text>;
    }

    // Renderiza a FlatList com os dados FILTRADOS
    return (
      <FlatList
        data={filteredPessoas} // <-- USA A LISTA FILTRADA
        keyExtractor={(item) => item.pessoa_id.toString()}
        renderItem={({ item }) => (
          <PessoaListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* --- Área de Filtros --- */}
      <View style={styles.filterContainer}>
         <TextInput
            style={styles.searchInput}
            placeholder="Nome ou email"
            value={searchTerm}
            onChangeText={setSearchTerm} // Atualiza o estado de busca
            placeholderTextColor="#888"
         />
         <View style={styles.pickerWrapper}>
            <Picker
               selectedValue={selectedType}
               style={styles.picker}
               onValueChange={(itemValue, itemIndex) => setSelectedType(itemValue)} // Atualiza o estado do tipo
               dropdownIconColor="#000" // Cor da seta (pode variar)
            >
               <Picker.Item label=" Tipo de usuário" value="Qualquer" />
               <Picker.Item label=" Admin" value="Admin" />
               <Picker.Item label=" Pessoa Física" value="Fisica" />
               <Picker.Item label=" Pessoa Jurídica" value="Juridica" />
            </Picker>
         </View>
      </View>
      {/* --- Fim Área de Filtros --- */}

      {/* Botão Adicionar (opcional, descomente se necessário) */}
      {/* <TouchableOpacity style={[styles.button, styles.addButton]} onPress={() => navigation.navigate('PessoaForm')}>
          <Text style={styles.buttonText}>Adicionar Pessoa</Text>
      </TouchableOpacity> */}

      {/* Renderiza o conteúdo principal (lista ou mensagens) */}
      {renderContent()}

      {/* Overlay de Loading (apenas durante fetch inicial, não durante refresh) */}
      {loading && !refreshing && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
    </View>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    filterContainer: {
      paddingHorizontal: 10, // Padding horizontal
      paddingVertical: 12,   // Padding vertical
      backgroundColor: '#e9ecef',
      borderBottomWidth: 1,
      borderBottomColor: '#ced4da',
      flexDirection: 'row',    // <-- Alinha itens horizontalmente
      alignItems: 'center',   // <-- Alinha itens verticalmente no centro da linha
    },
    searchInput: {
        height: 45,             // Manter altura
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        flex: 1,                // <-- Faz a busca ocupar o espaço restante
        marginRight: 10,        // <-- Espaço entre a busca e o dropdown
        fontSize: 15,
        // Removido marginBottom
    },
    pickerWrapper: {
        height: 50,             // Manter altura (ou pode ajustar para 45 se preferir)
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: 'white',
        justifyContent: 'center',
        width: 150,             // <-- Define uma largura fixa menor para o dropdown (ajuste conforme necessário)
        // Alternativa: width: '35%', // Ou use uma porcentagem
    },
    picker: {
        paddingLeft: 5,
        borderRadius: 5,
        borderColor: '#ced4da',
        height: 50,             // Manter altura
        width: '100%',          // O Picker ocupa 100% do seu wrapper
    },
    list: { padding: 10, paddingBottom: 20 }, // Mais espaço no fim da lista
    listItem: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    listItemInactive: { backgroundColor: '#e9ecef', opacity: 0.7 }, // Levemente mais opaco
    listItemText: { flex: 1, marginRight: 10 },
    listItemButtons: { flexDirection: 'row' },
    itemTextTitle: { fontSize: 16, fontWeight: 'bold', color: '#343a40', marginBottom: 3 }, // Cor escura
    itemSubText: { fontSize: 13, color: '#6c757d' }, // Cinza para subtexto
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 20, fontSize: 16, color: '#6c757d' }, // Estilo para mensagens centradas
    errorText: { color: '#dc3545', fontSize: 16, fontWeight: 'bold'}, // Vermelho para erro
    button: { padding: 10, borderRadius: 20, marginLeft: 8, justifyContent: 'center', alignItems: 'center', width: 40, height: 40 },
    editButton: { backgroundColor: '#ffc107' }, // Amarelo para editar
    deleteButton: { backgroundColor: '#dc3545' }, // Vermelho para excluir
    addButton: { backgroundColor: '#28a745', marginHorizontal: 10, marginBottom: 0, marginTop: 5, // Adicionado acima da lista
        padding: 12, alignSelf: 'stretch', alignItems: 'center', borderRadius: 8 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    loadingOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }
});

export default PessoaListScreen;