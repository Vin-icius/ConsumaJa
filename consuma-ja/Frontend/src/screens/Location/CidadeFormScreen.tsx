// src/screens/Location/CidadeFormScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Keyboard, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import locationService from '../../services/locationService';

// Interface para o estado (opcional, mas bom para clareza)
interface EstadoInfo {
    estado_id: number;
    estado_nome: string;
    estado_sigla: string;
}

const CidadeFormScreen = ({ route, navigation }) => {
  const cidadeParaEditar = route.params?.cidadeParaEditar;
  const isEditing = !!cidadeParaEditar;

  const [nome, setNome] = useState('');
  const [ddd, setDdd] = useState('');
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [allEstados, setAllEstados] = useState<EstadoInfo[]>([]);

  // Buscar estados (lógica mantida)
  useEffect(() => {
    let isMounted = true;
    const fetchEstados = async () => {
      setLoadingEstados(true);
      try {
        const response = await locationService.getEstados();
        if (isMounted) {
            setAllEstados(response.data || []);
            const estadoIdParaSelecionar = cidadeParaEditar?.estado_id;
            if (isEditing && estadoIdParaSelecionar) {
                // Garantir que estamos setando um número aqui também
                setSelectedEstadoId(Number(estadoIdParaSelecionar));
            }
        }
      } catch (error) {
        console.error("Erro ao buscar lista de estados:", error);
         if (isMounted) { Alert.alert("Erro", "Não foi possível carregar a lista de estados."); }
      } finally {
         if (isMounted) { setLoadingEstados(false); }
      }
    };
    fetchEstados();
    return () => { isMounted = false; };
  }, [isEditing, cidadeParaEditar]);

  // Preencher formulário (lógica mantida)
  useEffect(() => {
    if (isEditing) {
      setNome(cidadeParaEditar.cidade_nome || '');
      setDdd(cidadeParaEditar.regiao_ddd || '');
      navigation.setOptions({ title: 'Editar Cidade' });
    } else {
      navigation.setOptions({ title: 'Adicionar Cidade' });
    }
  }, [isEditing, cidadeParaEditar, navigation]);

  // Validar campos (lógica mantida)
  const validarCampos = () => { /* ... código mantido ... */
    const newErrors: { [key: string]: string } = {};
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!ddd.trim()) newErrors.ddd = 'DDD é obrigatório';
    else if (ddd.trim().length < 2 || ddd.trim().length > 4) newErrors.ddd = 'DDD inválido (2 a 4 dígitos)';
    if (!isEditing && !selectedEstadoId) newErrors.estado = 'Selecione um estado';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validarCampos()) {
      return;
    }
    setLoading(true);
    setErrors({});

    // Monta o objeto base
    const cidadeDataPayload: {
        cidade_nome: string;
        regiao_ddd: string;
        estado_id?: number; // estado_id é opcional aqui
     } = {
      cidade_nome: nome.trim(),
      regiao_ddd: ddd.trim(),
    };

    // Adiciona estado_id como NÚMERO apenas na criação
    if (!isEditing) {
        // <<< FIX 2: Garante que é número ao enviar >>>
        cidadeDataPayload.estado_id = Number(selectedEstadoId);
        // Verifica se a conversão resultou em NaN (caso selectedEstadoId fosse null ou algo não numérico)
        if (isNaN(cidadeDataPayload.estado_id)) {
             console.error("Erro: Tentativa de criar cidade com estado_id inválido:", selectedEstadoId);
             Alert.alert("Erro", "Ocorreu um problema ao selecionar o estado.");
             setLoading(false);
             return;
        }
    }

    try {
      if (isEditing) {
        await locationService.updateCidade(cidadeParaEditar.cidade_id, cidadeDataPayload); // Envia sem estado_id
        Alert.alert('Sucesso', 'Cidade atualizada com sucesso!');
      } else {
        // Garante que estado_id está presente para criação
        if (cidadeDataPayload.estado_id === undefined || cidadeDataPayload.estado_id === null) {
             throw new Error("ID do Estado é necessário para criar a cidade.");
        }
        await locationService.createCidade(cidadeDataPayload as any); // Envia com estado_id numérico
        Alert.alert('Sucesso', 'Cidade criada com sucesso!');
      }
      navigation.goBack();
    } catch (err: any) {
        // Tratamento de erro mantido
         console.error("Erro ao salvar cidade:", err);
         const defaultMessage = isEditing ? "Não foi possível atualizar a cidade." : "Não foi possível criar a cidade.";
         const message = err.response?.data?.message || err.message || defaultMessage;
         if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) { Alert.alert("Erro de Validação", err.response.data.errors.join('\n')); }
         else if (err.response?.status === 409) { Alert.alert("Erro de Conflito", message); }
         else if (err.response?.status === 400) { Alert.alert("Erro nos Dados", message); }
         else { Alert.alert("Erro Inesperado", message); }
    } finally {
      setLoading(false);
    }
  };

  return (
     <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
            {/* Inputs Nome e DDD (mantidos) */}
            <Text style={styles.label}>Nome da Cidade:</Text>
            <TextInput value={nome} onChangeText={setNome} style={[styles.input, errors.nome ? styles.inputError : null]} placeholder="Ex: Presidente Prudente" maxLength={45}/>
            {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}

            <Text style={styles.label}>DDD:</Text>
            <TextInput value={ddd} onChangeText={(text) => setDdd(text.replace(/\D/g, ''))} style={[styles.input, errors.ddd ? styles.inputError : null]} placeholder="Ex: 18" maxLength={4} keyboardType="numeric"/>
            {errors.ddd && <Text style={styles.errorText}>{errors.ddd}</Text>}


            <Text style={styles.label}>Estado:</Text>
            {loadingEstados ? ( <ActivityIndicator size="small" color="#0066cc" style={{ height: 50, marginBottom: 15 }}/> ) : (
                <View style={[ styles.pickerContainer, errors.estado ? styles.inputError : null, isEditing ? styles.pickerDisabledBackground : null ]}>
                    <Picker
                        selectedValue={selectedEstadoId}
                        enabled={!isEditing}
                        onValueChange={(itemValue, itemIndex) => {
                            if (!isEditing) {
                                // <<< FIX 1: Converte para número ao setar o estado >>>
                                const numericValue = itemValue === null || itemValue === undefined || itemIndex === 0 ? null : Number(itemValue);
                                setSelectedEstadoId(numericValue);
                            }
                        }}
                        style={[styles.picker, isEditing ? styles.pickerDisabledText : null]}
                        prompt="Selecione um Estado"
                    >
                         {/* Item placeholder */}
                         {/* Garantir que o value do placeholder seja algo não numérico ou claramente distinto se precisar diferenciar */}
                         <Picker.Item label={isEditing ? (allEstados.find(e => e.estado_id === selectedEstadoId)?.estado_nome || '-- Carregando Estado --') : "-- Selecione um Estado --"} value={null} style={styles.pickerPlaceholder} enabled={!isEditing} />

                         {/* Mapeia estados */}
                         {/* A key e o value DEVEM ser estado.estado_id (que é número) */}
                         {allEstados.map((estado) => (
                            <Picker.Item
                                key={estado.estado_id}
                                label={`${estado.estado_nome} (${estado.estado_sigla})`}
                                value={estado.estado_id} // Passa número aqui
                            />
                         ))}
                         {/* Picker Item para modo de edição removido - lógica do placeholder e selectedValue já cuida disso */}
                    </Picker>
                </View>
            )}
            {errors.estado && <Text style={styles.errorText}>{errors.estado}</Text>}

            {/* Botão Salvar (mantido) */}
            <TouchableOpacity
                style={[styles.button, styles.saveButton, (loading || loadingEstados) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading || loadingEstados}
            >
                {loading ? (<ActivityIndicator size="small" color="#fff" />) : (<Text style={styles.buttonText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar Cidade'}</Text>)}
            </TouchableOpacity>
        </View>
     </ScrollView>
  );
};

// --- Estilos (mantidos) ---
const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    label: { fontSize: 16, marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 10, paddingHorizontal: 15, marginBottom: 15, borderRadius: 5, fontSize: 16, backgroundColor: '#f9f9f9' },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, backgroundColor: '#f9f9f9' },
    picker: { height: 50 },
    pickerPlaceholder: { color: 'grey' },
    pickerDisabledBackground: { backgroundColor: '#e9ecef' },
    pickerDisabledText: { color: '#6c757d' },
    inputError: { borderColor: 'red' },
    errorText: { color: 'red', fontSize: 12, marginBottom: 10, marginTop: -10 },
    button: { padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
    saveButton: { backgroundColor: '#0066cc' },
    buttonDisabled: { backgroundColor: '#a7c7e7' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default CidadeFormScreen;