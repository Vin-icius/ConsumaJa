import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Button, TextInput, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Dimensions  } from 'react-native';
import avaliacaoService, { FiltrosRelatorio } from '../../services/avaliacaoService';

const formatDateInput = (text: string): string => {
  const digitsOnly = text.replace(/\D/g, '').slice(0, 8);

  if (digitsOnly.length > 6) {
    return `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 6)}-${digitsOnly.slice(6)}`;
  } else if (digitsOnly.length > 4) {
    return `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;
  } else {
    return digitsOnly;
  }
};

const getDateFromPeriod = (period: string): string | undefined => {
  if (!period) return undefined;
  const date = new Date();
  if (period === '30d') date.setDate(date.getDate() - 30);
  else if (period === '6m') date.setMonth(date.getMonth() - 6);
  else if (period === '1y') date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().split('T')[0];
};

const RelatorioAvaliacoesScreen = () => {
  const { width: screenWidth } = Dimensions.get('window');
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosRelatorio>({});
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('');
  const [dataInicioInput, setDataInicioInput] = useState('');
  const [dataFimInput, setDataFimInput] = useState('');

  const fetchRelatorio = useCallback(async (pagina = 1) => {
    setLoading(true);
    setError(null);
    try {
      const filtrosFinais: FiltrosRelatorio = {
        ...filtros,
        dataInicio: dataInicioInput || getDateFromPeriod(filtroPeriodo),
        dataFim: dataFimInput || undefined,
        page: pagina,
      };
      Object.keys(filtrosFinais).forEach(key => {
        const value = (filtrosFinais as any)[key];
        if (value === undefined || value === '') delete (filtrosFinais as any)[key];
      });
      const response = await avaliacaoService.gerarRelatorio(filtrosFinais);
      setItens(response.data);
    } catch (err) {
      setError("Não foi possível carregar o relatório.");
    } finally {
      setLoading(false);
    }
  }, [filtros, filtroPeriodo, dataInicioInput, dataFimInput]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchRelatorio(1); }, 500);
    return () => clearTimeout(timer);
  }, [filtros, filtroPeriodo, dataInicioInput, dataFimInput]);

  const handlePeriodoButtonPress = (periodo: string) => {
    setDataInicioInput('');
    setDataFimInput('');
    setFiltroPeriodo(periodo);
  };
  
  const handleDateInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setFiltroPeriodo('');
    const formattedDate = formatDateInput(value);
    setter(formattedDate);
  };

  const handleClearFilters = () => {
    setFiltros({});
    setFiltroPeriodo('');
    setDataInicioInput('');
    setDataFimInput('');
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'center' }]}>Cliente ID</Text>
      <Text style={[styles.tableHeaderCell, { flex: 5 }]}>Cliente</Text>
      <Text style={[styles.tableHeaderCell, { flex: 5 }]}>Pergunta</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Nota</Text>
      <Text style={[styles.tableHeaderCell, { flex: 2.5, textAlign: 'center' }]}>Data</Text>
      <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'center' }]}>Promo ID</Text>
      <Text style={[styles.tableHeaderCell, { flex: 5 }]}>Promoção</Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, { flex: 2, textAlign: 'center' }]}>{item.pessoa_id}</Text>
      <Text style={[styles.tableCell, { flex: 5 }]} numberOfLines={1}>{item.pessoa_nome}</Text>
      <Text style={[styles.tableCell, { flex: 5 }]} numberOfLines={2}>{item.pergunta_descricao}</Text>
      <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>{item.nota}</Text>
      <Text style={[styles.tableCell, { flex: 2.5, textAlign: 'center' }]}>{new Date(item.avaliacao_data).toLocaleDateString()}</Text>
      <Text style={[styles.tableCell, { flex: 2, textAlign: 'center' }]}>{item.promocao_id || '-'}</Text>
      <Text style={[styles.tableCell, { flex: 5 }]} numberOfLines={1}>{item.promocao_descricao || '-'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.filtersContainer}>
          <Text style={styles.title}>Relatório de Avaliações</Text>
          <TextInput
            placeholder="Filtrar por ID do Cliente"
            style={styles.input}
            keyboardType="numeric"
            onChangeText={text => setFiltros(prev => ({ ...prev, clienteId: Number(text) || undefined }))}
          />
          <TextInput
            placeholder="Filtrar por Nota (1-5)"
            style={styles.input}
            keyboardType="numeric"
            onChangeText={text => setFiltros(prev => ({ ...prev, nota: Number(text) || undefined }))}
          />
          <TextInput
            placeholder="Filtrar por ID da Promoção"
            style={styles.input}
            keyboardType="numeric"
            onChangeText={text => setFiltros(prev => ({ ...prev, promocaoId: Number(text) || undefined }))}
          />

          <Text style={styles.filterLabel}>Filtrar por Período (Fixo):</Text>
          <View style={styles.periodButtonContainer}>
            <TouchableOpacity 
              style={[styles.periodButton, filtroPeriodo === '' && styles.periodButtonActive]} 
              onPress={() => handlePeriodoButtonPress('')}>
              <Text style={[styles.periodButtonText, filtroPeriodo === '' && styles.periodButtonTextActive]}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, filtroPeriodo === '30d' && styles.periodButtonActive]} 
              onPress={() => handlePeriodoButtonPress('30d')}>
              <Text style={[styles.periodButtonText, filtroPeriodo === '30d' && styles.periodButtonTextActive]}>30 dias</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, filtroPeriodo === '6m' && styles.periodButtonActive]} 
              onPress={() => handlePeriodoButtonPress('6m')}>
              <Text style={[styles.periodButtonText, filtroPeriodo === '6m' && styles.periodButtonTextActive]}>6 meses</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, filtroPeriodo === '1y' && styles.periodButtonActive]} 
              onPress={() => handlePeriodoButtonPress('1y')}>
              <Text style={[styles.periodButtonText, filtroPeriodo === '1y' && styles.periodButtonTextActive]}>1 ano</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.filterLabel}>Ou por Período Específico (AAAA-MM-DD):</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              placeholder="Data de Início"
              style={styles.dateInput}
              value={dataInicioInput}
              onChangeText={(text) => handleDateInputChange(setDataInicioInput, text)}
            />
            <TextInput
              placeholder="Data de Fim"
              style={styles.dateInput}
              value={dataFimInput}
              onChangeText={(text) => handleDateInputChange(setDataFimInput, text)}
            />
          </View>
          
          <View style={{ marginTop: 20 }}>
            <Button title="Limpar Filtros" onPress={handleClearFilters} color="#6c757d" />
          </View>
        </View>

        {loading && <ActivityIndicator size="large" style={{ margin: 20 }}/>}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading && <ActivityIndicator size="large" style={{ margin: 20 }}/>}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && (
          // O ScrollView horizontal agora tem um estilo
          <ScrollView horizontal contentContainerStyle={styles.scrollViewContainer}>
            {/* O View da tabela agora tem a largura mínima da tela */}
            <View style={[styles.tableContainer, { minWidth: screenWidth }]}>
              <FlatList
                data={itens}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.avaliacao_id}-${item.pergunta_id}-${index}`}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>}
                stickyHeaderIndices={[0]}
              />
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos agora ficam dentro do mesmo arquivo para evitar erros de importação
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
  filtersContainer: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  filterLabel: { fontSize: 16, fontWeight: '500', color: '#333', marginTop: 10, marginBottom: 5 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5, fontSize: 16 },
  periodButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  periodButton: { flex: 1, paddingVertical: 10, marginHorizontal: 2, borderWidth: 1, borderColor: '#007bff', borderRadius: 5 },
  periodButtonActive: { backgroundColor: '#007bff' },
  periodButtonText: { textAlign: 'center', color: '#007bff', fontWeight: 'bold' },
  periodButtonTextActive: { color: '#fff' },
  dateInputContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  dateInput: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5, fontSize: 16, marginHorizontal: 2 },
  tableContainer: { marginTop: 10, borderWidth: 1, borderColor: '#dee2e6', backgroundColor: 'white' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', borderBottomWidth: 2, borderBottomColor: '#dee2e6' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tableHeaderCell: { padding: 12, fontWeight: 'bold', fontSize: 14, color: '#495057' },
  tableCell: { padding: 12, fontSize: 14, color: '#212529' },
  errorText: { color: 'red', textAlign: 'center', padding: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16, padding: 20 },
  scrollViewContainer: { flexGrow: 1 }
 });

export default RelatorioAvaliacoesScreen;