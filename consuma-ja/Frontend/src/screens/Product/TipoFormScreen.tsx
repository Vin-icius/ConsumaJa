import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Keyboard, ScrollView } from 'react-native';
import tipoService from '../../services/tipoService'; // Importar o serviço
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { tipoFormStyles } from '../../common/styles/Product/tipoFormScreen.styled';

// Definir tipos
interface TipoItem {
    tipo_id: number;
    tipo_nome: string;
    ativo: boolean;
}
// type ProductStackParamList = {
//   TipoList: undefined;
//   TipoForm: { tipoParaEditar?: TipoItem };
// };
// type TipoFormNavigationProp = NativeStackNavigationProp<ProductStackParamList, 'TipoForm'>;
// type TipoFormRouteProp = RouteProp<ProductStackParamList, 'TipoForm'>;

const TipoFormScreen = () => {
  const navigation = useNavigation<any>(); // Usar tipo correto
  const route = useRoute<any>(); // Usar tipo correto

  const tipoParaEditar = route.params?.tipoParaEditar;
  const isEditing = !!tipoParaEditar;

  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string }>({});

  useEffect(() => {
    if (isEditing && tipoParaEditar) {
      setNome(tipoParaEditar.tipo_nome || '');
      navigation.setOptions({ title: 'Editar Tipo' });
    } else {
      navigation.setOptions({ title: 'Adicionar Tipo' });
    }
  }, [isEditing, tipoParaEditar, navigation]);

  const validarCampos = (): boolean => {
    const newErrors: { nome?: string } = {};
    if (!nome.trim()) {
         newErrors.nome = 'Nome do tipo é obrigatório';
    } else if (nome.trim().length < 3) { // Exemplo
         newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
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

    const tipoData = {
      tipo_nome: nome.trim(),
    };

    try {
      if (isEditing && tipoParaEditar) {
        await tipoService.atualizarTipo(tipoParaEditar.tipo_id, tipoData);
        Alert.alert('Sucesso', 'Tipo atualizado com sucesso!');
      } else {
        await tipoService.criarTipo(tipoData);
        Alert.alert('Sucesso', 'Tipo criado com sucesso!');
      }
      navigation.goBack();

    } catch (err: any) {
      console.error("Erro ao salvar tipo:", err);
       const defaultMessage = isEditing ? "Não foi possível atualizar o tipo." : "Não foi possível criar o tipo.";
       const message = err.response?.data?.message || err.message || defaultMessage;

      if (err.response?.status === 409) {
         setErrors({ nome: message });
         Alert.alert("Erro de Conflito", message);
      } else if (err.response?.status === 400 && err.response?.data?.errors) {
           Alert.alert("Erro de Validação", err.response.data.errors.join('\n'));
      } else if (err.response?.status === 400) {
           Alert.alert("Erro nos Dados", message);
      } else {
           Alert.alert("Erro Inesperado", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
     <ScrollView contentContainerStyle={tipoFormStyles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={tipoFormStyles.container}>
            <Text style={tipoFormStyles.label}>Nome do Tipo:</Text>
            <TextInput
                style={[tipoFormStyles.input, errors.nome ? tipoFormStyles.inputError : null]}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex: Suco Natural, Refrigerante"
                maxLength={255}
                autoCapitalize="words"
            />
            {errors.nome && <Text style={tipoFormStyles.errorText}>{errors.nome}</Text>}

            <TouchableOpacity
                style={[tipoFormStyles.button, tipoFormStyles.saveButton, loading && tipoFormStyles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                <ActivityIndicator size="small" color="#fff" />
                ) : (
                <Text style={tipoFormStyles.buttonText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar Tipo'}</Text>
                )}
            </TouchableOpacity>
        </View>
     </ScrollView>
  );
};

export default TipoFormScreen;