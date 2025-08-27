import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Keyboard, ScrollView } from 'react-native';
import categoriaService from '../../services/categoriaService'; // Importar o serviço
import { useNavigation, useRoute } from '@react-navigation/native'; // Importar hooks
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Tipagem (opcional)
import type { RouteProp } from '@react-navigation/native'; // Tipagem (opcional)
import { categoriaFormStyles } from '../../common/styles/Product/categoriaFormSreen.styled';

// Definir tipos para o item Categoria e parâmetros da rota
interface CategoriaItem {
    categoria_id: number;
    categoria_nome: string;
    ativo: boolean;
}
// type ProductStackParamList = { // Definir em um arquivo central de tipos de navegação
//   CategoriaList: undefined;
//   CategoriaForm: { categoriaParaEditar?: CategoriaItem };
// };
// type CategoriaFormNavigationProp = NativeStackNavigationProp<ProductStackParamList, 'CategoriaForm'>;
// type CategoriaFormRouteProp = RouteProp<ProductStackParamList, 'CategoriaForm'>;

const CategoriaFormScreen = () => {
  // Usar hooks para navigation e route
  const navigation = useNavigation<any>(); // Usar tipo correto: CategoriaFormNavigationProp
  const route = useRoute<any>(); // Usar tipo correto: CategoriaFormRouteProp

  const categoriaParaEditar = route.params?.categoriaParaEditar;
  const isEditing = !!categoriaParaEditar;

  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string }>({}); // Tipar erros

  // Preenche o formulário se estiver editando
  useEffect(() => {
    if (isEditing && categoriaParaEditar) {
      setNome(categoriaParaEditar.categoria_nome || '');
      navigation.setOptions({ title: 'Editar Categoria' });
    } else {
      navigation.setOptions({ title: 'Adicionar Categoria' });
    }
  }, [isEditing, categoriaParaEditar, navigation]);

  const validarCampos = (): boolean => {
    const newErrors: { nome?: string } = {};
    if (!nome.trim()) {
         newErrors.nome = 'Nome da categoria é obrigatório';
    } else if (nome.trim().length < 3) {
         newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    // Adicione mais validações se necessário (ex: tamanho máximo baseado no DTO/DB)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retorna true se não houver erros
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validarCampos()) {
      return;
    }
    setLoading(true);
    setErrors({});

    const categoriaData = {
      categoria_nome: nome.trim(),
      // Não envia ID nem 'ativo'
    };

    try {
      if (isEditing && categoriaParaEditar) {
        // --- Atualização ---
        await categoriaService.atualizarCategoria(categoriaParaEditar.categoria_id, categoriaData);
        Alert.alert('Sucesso', 'Categoria atualizada com sucesso!');
      } else {
        // --- Criação ---
        await categoriaService.criarCategoria(categoriaData);
        Alert.alert('Sucesso', 'Categoria criada com sucesso!');
      }
      navigation.goBack(); // Volta para a lista

    } catch (err: any) { // Tipar erro
      console.error("Erro ao salvar categoria:", err);
       const defaultMessage = isEditing ? "Não foi possível atualizar a categoria." : "Não foi possível criar a categoria.";
       const message = err.response?.data?.message || err.message || defaultMessage;

      // Trata erros específicos que podem vir do backend (baseado no AppError)
      if (err.response?.status === 409) { // Conflito (nome já existe)
         setErrors({ nome: message }); // Marca o campo nome com o erro vindo do backend
         Alert.alert("Erro de Conflito", message);
      } else if (err.response?.status === 400) { // Bad Request (validação DTO falhou no backend)
          // Se backend retorna array de erros de validação:
          if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
               // Tenta mapear erros para os campos (simplificado)
               const backendErrors = err.response.data.errors.reduce((acc: any, val: any) => {
                  if (val.field === 'categoria_nome') acc.nome = val.messages.join(', ');
                   return acc;
               }, {});
               setErrors(backendErrors);
               Alert.alert("Erro de Validação", "Verifique os campos marcados.");
          } else {
               Alert.alert("Erro nos Dados", message); // Mensagem genérica de Bad Request
          }
      }
      else {
           Alert.alert("Erro Inesperado", message); // Erro 500 ou outro
      }
    } finally {
      setLoading(false);
    }
  };

  return (
     <ScrollView contentContainerStyle={categoriaFormStyles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={categoriaFormStyles.container}>
            <Text style={categoriaFormStyles.label}>Nome da Categoria:</Text>
            <TextInput
                style={[categoriaFormStyles.input, errors.nome ? categoriaFormStyles.inputError : null]}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex: Bebidas, Laticínios"
                maxLength={255} // Definir MaxLength igual ao backend DTO
                autoCapitalize="words"
            />
            {errors.nome && <Text style={categoriaFormStyles.errorText}>{errors.nome}</Text>}

            <TouchableOpacity
                style={[categoriaFormStyles.button, categoriaFormStyles.saveButton, loading && categoriaFormStyles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                <ActivityIndicator size="small" color="#fff" />
                ) : (
                <Text style={categoriaFormStyles.buttonText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar Categoria'}</Text>
                )}
            </TouchableOpacity>
        </View>
     </ScrollView>
  );
};

export default CategoriaFormScreen;