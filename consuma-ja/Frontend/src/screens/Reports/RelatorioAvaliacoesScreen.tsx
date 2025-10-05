import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Button, TextInput, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import avaliacaoService, { FiltrosRelatorio } from '../../services/avaliacaoService';

// Função helper para calcular datas (permanece a mesma)
const getDateFromPeriod = (period: string): string | undefined => {
    if (!period) return undefined;
    const date = new Date();
    if (period === '30d') date.setDate(date.getDate() - 30);
    else if (period === '6m') date.setMonth(date.getMonth() - 6);
    else if (period === '1y') date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0]; // Formato AAAA-MM-DD
};

const RelatorioAvaliacoesScreen = () => {
    const [itens, setItens] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Estados dos filtros
    const [filtros, setFiltros] = useState<FiltrosRelatorio>({});
    const [filtroPeriodo, setFiltroPeriodo] = useState<string>(''); // Para os botões de período

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
                page: pagina
            };

            Object.keys(filtrosFinais).forEach(key => {
                const value = (filtrosFinais as any)[key];
                if (value === undefined || value === '') {
                    delete (filtrosFinais as any)[key];
                }
            });

            const response = await avaliacaoService.gerarRelatorio(filtrosFinais);
            setItens(pagina === 1 ? response.data : [...itens, ...response.data]);
            setTotal(response.total);
            setPage(pagina);
        } catch (err) {
            setError("Não foi possível carregar o relatório.");
        } finally {
            setLoading(false);
        }
    }, [filtros, filtroPeriodo, dataInicioInput, dataFimInput]);

    // Usamos useEffect para buscar dados quando os filtros mudam
    useEffect(() => {
        const timer = setTimeout(() => { fetchRelatorio(1); }, 500);
        return () => clearTimeout(timer);
    }, [filtros, filtroPeriodo, dataInicioInput, dataFimInput]);

    const handlePeriodoButtonPress = (periodo: string) => {
        setDataInicioInput('');
        setDataFimInput('');
        setFiltroPeriodo(periodo);
    };

    // Quando o usuário começa a digitar uma data, limpa a seleção do botão de período
    const handleDateInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setFiltroPeriodo('');
        setter(value);
    };

    const handleClearFilters = () => {
        setFiltros({});
        setFiltroPeriodo('');
        setDataInicioInput('');
        setDataFimInput('');
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemHeader}>Avaliação #{item.avaliacao_id} - {new Date(item.avaliacao_data).toLocaleDateString()}</Text>
            <Text>Cliente: {item.pessoa_nome} (ID: {item.pessoa_id})</Text>
            <Text>Pergunta: "{item.pergunta_descricao}"</Text>
            <Text style={styles.itemNota}>Nota: {item.nota} / 5</Text>
            {item.promocao_descricao && <Text style={styles.itemPromocao}>Promoção: {item.promocao_descricao}</Text>}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={itens}
                renderItem={renderItem} // Passa a função renderItem que já definimos
                keyExtractor={(item, index) => `${item.avaliacao_id}-${item.pergunta_id}-${index}`}
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>Relatório de Avaliações</Text>
                        <View style={styles.filtersContainer}>
                            <TextInput
                                placeholder="Filtrar por ID do Cliente"
                                keyboardType="numeric"
                                style={styles.input}
                                onChangeText={text => setFiltros(prev => ({ ...prev, clienteId: Number(text) || undefined }))}
                            />
                            <TextInput
                                placeholder="Filtrar por Nota (1-5)"
                                keyboardType="numeric"
                                style={styles.input}
                                onChangeText={text => setFiltros(prev => ({ ...prev, nota: Number(text) || undefined }))}
                            />
                            <TextInput
                                placeholder="Filtrar por ID da Promoção"
                                keyboardType="numeric"
                                style={styles.input}
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
                        {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </>
                }
                ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text> : null}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
    filtersContainer: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    filterLabel: { fontSize: 16, fontWeight: '500', color: '#333', marginTop: 10, marginBottom: 5 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5, fontSize: 16 },
    periodButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 2,
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 5,
    },
    periodButtonActive: {
        backgroundColor: '#007bff',
    },
    periodButtonText: {
        textAlign: 'center',
        color: '#007bff',
        fontWeight: 'bold',
    },
    periodButtonTextActive: {
        color: '#fff',
    },
    itemContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white' },
    itemHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    itemNota: { fontWeight: 'bold', marginTop: 5 },
    itemPromocao: { fontStyle: 'italic', color: '#555', marginTop: 5 },
    errorText: { color: 'red', textAlign: 'center', padding: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16 },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateInput: {
        flex: 1,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        fontSize: 16,
        marginHorizontal: 2,
    },
});

export default RelatorioAvaliacoesScreen;