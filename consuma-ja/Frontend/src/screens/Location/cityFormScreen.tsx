// src/screens/Location/CidadeFormScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Keyboard, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import locationService from '../../services/locationService';
import { cityStyles } from '../../common/styles/Location/cityFormScreen.styled';

// Interface para o estado (opcional, mas bom para clareza)
interface EstadoInfo {
    estado_id: number;
    estado_nome: string;
    estado_sigla: string;
}

type RootStackParamList = {
    CityForm: { cidadeParaEditar?: any };
};

type CityFormScreenRouteProp = RouteProp<RootStackParamList, 'CityForm'>;
type CityFormScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CityForm'>;

const CityFormScreen = ({ route, navigation }: any) => {
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
          const estadosData = (Array.isArray(response) ? response : response?.data || []) as EstadoInfo[];
          setAllEstados(estadosData);
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
     <ScrollView contentContainerStyle={cityStyles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={cityStyles.container}>
            {/* Inputs Nome e DDD (mantidos) */}
            <Text style={cityStyles.label}>Nome da Cidade:</Text>
            <TextInput value={nome} onChangeText={setNome} style={[cityStyles.input, errors.nome ? cityStyles.inputError : null]} placeholder="Ex: Presidente Prudente" maxLength={45}/>
            {errors.nome && <Text style={cityStyles.errorText}>{errors.nome}</Text>}

            <Text style={cityStyles.label}>DDD:</Text>
            <TextInput value={ddd} onChangeText={(text) => setDdd(text.replace(/\D/g, ''))} style={[cityStyles.input, errors.ddd ? cityStyles.inputError : null]} placeholder="Ex: 18" maxLength={4} keyboardType="numeric"/>
            {errors.ddd && <Text style={cityStyles.errorText}>{errors.ddd}</Text>}


            <Text style={cityStyles.label}>Estado:</Text>
            {loadingEstados ? ( <ActivityIndicator size="small" color="#0066cc" style={{ height: 50, marginBottom: 15 }}/> ) : (
                <View style={[ cityStyles.pickerContainer, errors.estado ? cityStyles.inputError : null, isEditing ? cityStyles.pickerDisabledBackground : null ]}>
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
                        style={[cityStyles.picker, isEditing ? cityStyles.pickerDisabledText : null]}
                        prompt="Selecione um Estado"
                    >
                         {/* Item placeholder */}
                         {/* Garantir que o value do placeholder seja algo não numérico ou claramente distinto se precisar diferenciar */}
                         <Picker.Item label={isEditing ? (allEstados.find(e => e.estado_id === selectedEstadoId)?.estado_nome || '-- Carregando Estado --') : "-- Selecione um Estado --"} value={null} style={cityStyles.pickerPlaceholder} enabled={!isEditing} />

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
            {errors.estado && <Text style={cityStyles.errorText}>{errors.estado}</Text>}

            {/* Botão Salvar (mantido) */}
            <TouchableOpacity
                style={[cityStyles.button, cityStyles.saveButton, (loading || loadingEstados) && cityStyles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading || loadingEstados}
            >
                {loading ? (<ActivityIndicator size="small" color="#fff" />) : (<Text style={cityStyles.buttonText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar Cidade'}</Text>)}
            </TouchableOpacity>
        </View>
     </ScrollView>
  );
};

export default CityFormScreen;