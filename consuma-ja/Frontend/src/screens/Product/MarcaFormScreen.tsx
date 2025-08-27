import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Keyboard, ScrollView } from 'react-native';
import marcaService from '../../services/marcaService'; // Importar o serviço
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { marcaFormStyles } from '../../common/styles/Product/marcaFormScreen.styled';

// Definir tipos
interface MarcaItem {
    marca_id: number;
    marca_nome: string;
    ativo: boolean;
}
// Ajustar ProductStackParamList para incluir MarcaForm
// type ProductStackParamList = {
//   MarcaList: undefined;
//   MarcaForm: { marcaParaEditar?: MarcaItem };
// };
// type MarcaFormNavigationProp = NativeStackNavigationProp<ProductStackParamList, 'MarcaForm'>;
// type MarcaFormRouteProp = RouteProp<ProductStackParamList, 'MarcaForm'>;

const MarcaFormScreen = () => {
  const navigation = useNavigation<any>(); // Usar tipo correto
  const route = useRoute<any>(); // Usar tipo correto

  const marcaParaEditar = route.params?.marcaParaEditar;
  const isEditing = !!marcaParaEditar;

  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string }>({});

  useEffect(() => {
    if (isEditing && marcaParaEditar) {
      setNome(marcaParaEditar.marca_nome || '');
      navigation.setOptions({ title: 'Editar Marca' });
    } else {
      navigation.setOptions({ title: 'Adicionar Marca' });
    }
  }, [isEditing, marcaParaEditar, navigation]);

  const validarCampos = (): boolean => {
    const newErrors: { nome?: string } = {};
    if (!nome.trim()) {
         newErrors.nome = 'Nome da marca é obrigatório';
    } else if (nome.trim().length < 2) { // Exemplo de validação mínima
         newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
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

    const marcaData = {
      marca_nome: nome.trim(),
    };

    try {
      if (isEditing && marcaParaEditar) {
        await marcaService.atualizarMarca(marcaParaEditar.marca_id, marcaData);
        Alert.alert('Sucesso', 'Marca atualizada com sucesso!');
      } else {
        await marcaService.criarMarca(marcaData);
        Alert.alert('Sucesso', 'Marca criada com sucesso!');
      }
      navigation.goBack();

    } catch (err: any) {
      console.error("Erro ao salvar marca:", err);
       const defaultMessage = isEditing ? "Não foi possível atualizar a marca." : "Não foi possível criar a marca.";
       const message = err.response?.data?.message || err.message || defaultMessage;

      if (err.response?.status === 409) { // Conflito (nome já existe)
         setErrors({ nome: message });
         Alert.alert("Erro de Conflito", message);
      } else if (err.response?.status === 400 && err.response?.data?.errors) { // Erro de validação DTO
           Alert.alert("Erro de Validação", err.response.data.errors.join('\n'));
      } else if (err.response?.status === 400) { // Outro Bad Request
           Alert.alert("Erro nos Dados", message);
      } else {
           Alert.alert("Erro Inesperado", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
     <ScrollView contentContainerStyle={marcaFormStyles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={marcaFormStyles.container}>
            <Text style={marcaFormStyles.label}>Nome da Marca:</Text>
            <TextInput
                style={[marcaFormStyles.input, errors.nome ? marcaFormStyles.inputError : null]}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex: Nestlé, Coca-Cola"
                maxLength={255} // Ajuste conforme DB/DTO
                autoCapitalize="words"
            />
            {errors.nome && <Text style={marcaFormStyles.errorText}>{errors.nome}</Text>}

            <TouchableOpacity
                style={[marcaFormStyles.button, marcaFormStyles.saveButton, loading && marcaFormStyles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                <ActivityIndicator size="small" color="#fff" />
                ) : (
                <Text style={marcaFormStyles.buttonText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar Marca'}</Text>
                )}
            </TouchableOpacity>
        </View>
     </ScrollView>
  );
};

export default MarcaFormScreen;