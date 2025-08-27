// src/screens/Product/AprovacaoDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Keyboard, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import produtoService from '../../services/produtoService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Tipo para o Produto completo (usar a interface do domain)
import type { Produto } from '../../../../Backend/product-service/src/domain/entities/produto.entity'; // Ajuste o caminho
import { aprovacaoDetailStyles } from '../../common/styles/Product/aprovacaoDetailScreen.styled';

// Tipagem Navegação (opcional)
// type ProductApprovalStackParamList = {
//   AprovacaoList: undefined;
//   AprovacaoDetail: { produtoId: number };
// };
// type AprovacaoDetailNavigationProp = NativeStackNavigationProp<ProductApprovalStackParamList, 'AprovacaoDetail'>;
// type AprovacaoDetailRouteProp = RouteProp<ProductApprovalStackParamList, 'AprovacaoDetail'>;

const AprovacaoDetailScreen = () => {
  const navigation = useNavigation<any>(); // Usar tipo correto
  const route = useRoute<any>(); // Usar tipo correto

  const produtoId = route.params?.produtoId;

  const [produto, setProduto] = useState<Produto | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [loading, setLoading] = useState(true); // Loading inicial dos dados
  const [actionLoading, setActionLoading] = useState(false); // Loading das ações
  const [error, setError] = useState<string | null>(null);

  // Busca os detalhes do produto ao carregar
  useEffect(() => {
    let isMounted = true;
    const fetchProduto = async () => {
      if (!produtoId) {
        setError("ID do produto não fornecido.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await produtoService.getProdutoById(produtoId);
        if (isMounted) {
             if (data) {
                 setProduto(data);
                 // Define título da tela com nome do produto
                 navigation.setOptions({ title: `Aprovar: ${data.produto_nome}` });
             } else {
                  setError(`Produto com ID ${produtoId} não encontrado.`);
             }
        }
      } catch (err: any) {
         console.error("Erro ao buscar detalhes do produto:", err);
         if (isMounted) {
             setError("Erro ao carregar detalhes do produto.");
         }
      } finally {
         if (isMounted) setLoading(false);
      }
    };

    fetchProduto();
    return () => { isMounted = false };
  }, [produtoId, navigation]);

  // --- Handlers de Aprovação/Rejeição ---
  const handleAprovar = async () => {
    setActionLoading(true);
    try {
      await produtoService.aprovarProduto(produtoId);
      Alert.alert("Sucesso", "Produto aprovado com sucesso!");
      navigation.goBack(); // Volta para a lista
    } catch (err: any) {
      console.error("Erro ao aprovar produto:", err);
      const message = err.response?.data?.message || err.message || "Não foi possível aprovar o produto.";
      Alert.alert("Erro", message);
      setActionLoading(false); // Permite tentar novamente
    }
    // setLoading(false) é chamado no finally implícito se não houver erro
  };

  const handleRejeitar = async () => {
    Keyboard.dismiss();
    if (!motivoRejeicao.trim()) {
        Alert.alert("Campo Obrigatório", "Por favor, informe o motivo da rejeição.");
        return;
    }
    setActionLoading(true);
    try {
      await produtoService.rejeitarProduto(produtoId, motivoRejeicao.trim());
      Alert.alert("Sucesso", "Produto rejeitado com sucesso!");
      navigation.goBack(); // Volta para a lista
    } catch (err: any) {
      console.error("Erro ao rejeitar produto:", err);
      const message = err.response?.data?.message || err.message || "Não foi possível rejeitar o produto.";
       // Tratar erro de validação do motivo (se houver no backend)
      if (err.response?.status === 400 && err.response?.data?.errors) {
          Alert.alert("Erro de Validação", err.response.data.errors.join('\n'));
      } else {
           Alert.alert("Erro", message);
      }
      setActionLoading(false); // Permite tentar novamente
    }
  };

  // --- Renderização ---
  if (loading) { return <ActivityIndicator size="large" color="#0066cc" style={aprovacaoDetailStyles.centered}/>; }
  if (error) { return <Text style={[aprovacaoDetailStyles.centered, aprovacaoDetailStyles.errorText]}>{error}</Text>; }
  if (!produto) { return <Text style={aprovacaoDetailStyles.centered}>Dados do produto não disponíveis.</Text>; }

  return (
     <ScrollView contentContainerStyle={aprovacaoDetailStyles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={aprovacaoDetailStyles.container}>
            <Text style={aprovacaoDetailStyles.title}>Detalhes do Produto</Text>

            <View style={aprovacaoDetailStyles.detailItem}>
                <Text style={aprovacaoDetailStyles.detailLabel}>ID:</Text>
                <Text style={aprovacaoDetailStyles.detailValue}>{produto.produto_id}</Text>
            </View>
             <View style={aprovacaoDetailStyles.detailItem}>
                <Text style={aprovacaoDetailStyles.detailLabel}>Nome:</Text>
                <Text style={aprovacaoDetailStyles.detailValue}>{produto.produto_nome}</Text>
            </View>
             <View style={aprovacaoDetailStyles.detailItem}>
                <Text style={aprovacaoDetailStyles.detailLabel}>Medida:</Text>
                <Text style={aprovacaoDetailStyles.detailValue}>{produto.produto_medida}</Text>
            </View>
             <View style={aprovacaoDetailStyles.detailItem}>
                <Text style={aprovacaoDetailStyles.detailLabel}>Preço Original:</Text>
                <Text style={aprovacaoDetailStyles.detailValue}>R$ {produto.produto_precoOriginal?.toFixed(2)}</Text>
            </View>
             <View style={aprovacaoDetailStyles.detailItem}>
                <Text style={aprovacaoDetailStyles.detailLabel}>Descrição:</Text>
                <Text style={aprovacaoDetailStyles.detailValue}>{produto.descricao || '(Sem descrição)'}</Text>
            </View>
            <View style={aprovacaoDetailStyles.detailItem}>
                <Text style={aprovacaoDetailStyles.detailLabel}>Categoria:</Text>
                <Text style={aprovacaoDetailStyles.detailValue}>{produto.categoria?.categoria_nome || '(Inválida/Inativa)'}</Text>
            </View>
             <View style={aprovacaoDetailStyles.detailItem}>
                <Text style={aprovacaoDetailStyles.detailLabel}>Marca:</Text>
                <Text style={aprovacaoDetailStyles.detailValue}>{produto.marca?.marca_nome || '(Inválida/Inativa)'}</Text>
            </View>
             <View style={aprovacaoDetailStyles.detailItem}>
                <Text style={aprovacaoDetailStyles.detailLabel}>Tipo:</Text>
                <Text style={aprovacaoDetailStyles.detailValue}>{produto.tipo?.tipo_nome || '(Inválido/Inativo)'}</Text>
            </View>
            <View style={aprovacaoDetailStyles.detailItem}>
                <Text style={aprovacaoDetailStyles.detailLabel}>Status Atual:</Text>
                <Text style={aprovacaoDetailStyles.detailValue}>{produto.produto_status}</Text>
            </View>
             <View style={aprovacaoDetailStyles.detailItem}>
                <Text style={aprovacaoDetailStyles.detailLabel}>Registrado em:</Text>
                <Text style={aprovacaoDetailStyles.detailValue}>{new Date(produto.data_registro).toLocaleString()}</Text>
            </View>


            <View style={aprovacaoDetailStyles.actionsContainer}>
                {/* Botão Aprovar */}
                 <TouchableOpacity
                    style={[aprovacaoDetailStyles.button, aprovacaoDetailStyles.approveButton, actionLoading && aprovacaoDetailStyles.buttonDisabled]}
                    onPress={handleAprovar}
                    disabled={actionLoading}
                 >
                    {actionLoading ? <ActivityIndicator size="small" color="#fff"/> : <Text style={aprovacaoDetailStyles.buttonText}>Aprovar Produto</Text>}
                </TouchableOpacity>

                {/* Seção Rejeitar */}
                <Text style={aprovacaoDetailStyles.label}>Motivo da Rejeição (Obrigatório se for rejeitar):</Text>
                <TextInput
                    style={[aprovacaoDetailStyles.input, aprovacaoDetailStyles.textArea]}
                    value={motivoRejeicao}
                    onChangeText={setMotivoRejeicao}
                    placeholder="Descreva por que o produto está sendo rejeitado..."
                    multiline
                    maxLength={200} // Conforme DTO backend
                    editable={!actionLoading} // Desabilita enquanto ação ocorre
                />
                 <TouchableOpacity
                     style={[aprovacaoDetailStyles.button, aprovacaoDetailStyles.rejectButton, actionLoading && aprovacaoDetailStyles.buttonDisabled]}
                     onPress={handleRejeitar}
                     disabled={actionLoading}
                  >
                     {actionLoading ? <ActivityIndicator size="small" color="#fff"/> : <Text style={aprovacaoDetailStyles.buttonText}>Rejeitar Produto</Text>}
                 </TouchableOpacity>
            </View>

        </View>
     </ScrollView>
  );
};

export default AprovacaoDetailScreen;