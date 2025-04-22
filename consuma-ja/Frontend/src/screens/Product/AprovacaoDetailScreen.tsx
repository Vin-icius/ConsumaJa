// src/screens/Product/AprovacaoDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Keyboard, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import produtoService from '../../services/produtoService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Tipo para o Produto completo (usar a interface do domain)
import type { Produto } from '../../../../Backend/product-service/src/domain/entities/produto.entity'; // Ajuste o caminho

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
  if (loading) { return <ActivityIndicator size="large" color="#0066cc" style={styles.centered}/>; }
  if (error) { return <Text style={[styles.centered, styles.errorText]}>{error}</Text>; }
  if (!produto) { return <Text style={styles.centered}>Dados do produto não disponíveis.</Text>; }

  return (
     <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
            <Text style={styles.title}>Detalhes do Produto</Text>

            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>ID:</Text>
                <Text style={styles.detailValue}>{produto.produto_id}</Text>
            </View>
             <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Nome:</Text>
                <Text style={styles.detailValue}>{produto.produto_nome}</Text>
            </View>
             <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Medida:</Text>
                <Text style={styles.detailValue}>{produto.produto_medida}</Text>
            </View>
             <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Preço Original:</Text>
                <Text style={styles.detailValue}>R$ {produto.produto_precoOriginal?.toFixed(2)}</Text>
            </View>
             <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Descrição:</Text>
                <Text style={styles.detailValue}>{produto.descricao || '(Sem descrição)'}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Categoria:</Text>
                <Text style={styles.detailValue}>{produto.categoria?.categoria_nome || '(Inválida/Inativa)'}</Text>
            </View>
             <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Marca:</Text>
                <Text style={styles.detailValue}>{produto.marca?.marca_nome || '(Inválida/Inativa)'}</Text>
            </View>
             <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tipo:</Text>
                <Text style={styles.detailValue}>{produto.tipo?.tipo_nome || '(Inválido/Inativo)'}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status Atual:</Text>
                <Text style={styles.detailValue}>{produto.produto_status}</Text>
            </View>
             <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Registrado em:</Text>
                <Text style={styles.detailValue}>{new Date(produto.data_registro).toLocaleString()}</Text>
            </View>


            <View style={styles.actionsContainer}>
                {/* Botão Aprovar */}
                 <TouchableOpacity
                    style={[styles.button, styles.approveButton, actionLoading && styles.buttonDisabled]}
                    onPress={handleAprovar}
                    disabled={actionLoading}
                 >
                    {actionLoading ? <ActivityIndicator size="small" color="#fff"/> : <Text style={styles.buttonText}>Aprovar Produto</Text>}
                </TouchableOpacity>

                {/* Seção Rejeitar */}
                <Text style={styles.label}>Motivo da Rejeição (Obrigatório se for rejeitar):</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={motivoRejeicao}
                    onChangeText={setMotivoRejeicao}
                    placeholder="Descreva por que o produto está sendo rejeitado..."
                    multiline
                    maxLength={200} // Conforme DTO backend
                    editable={!actionLoading} // Desabilita enquanto ação ocorre
                />
                 <TouchableOpacity
                     style={[styles.button, styles.rejectButton, actionLoading && styles.buttonDisabled]}
                     onPress={handleRejeitar}
                     disabled={actionLoading}
                  >
                     {actionLoading ? <ActivityIndicator size="small" color="#fff"/> : <Text style={styles.buttonText}>Rejeitar Produto</Text>}
                 </TouchableOpacity>
            </View>

        </View>
     </ScrollView>
  );
};

// Estilos (Combine/adapte de outros forms)
const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    detailItem: { flexDirection: 'row', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    detailLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', width: 120 }, // Largura fixa para alinhar
    detailValue: { fontSize: 16, color: '#555', flex: 1 }, // Ocupa resto do espaço
    actionsContainer: { marginTop: 30, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
    label: { fontSize: 16, marginBottom: 5, color: '#333', fontWeight: '500', marginTop: 15 },
    input: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 8, paddingHorizontal: 12, marginBottom: 15, borderRadius: 5, fontSize: 15, backgroundColor: '#f9f9f9' },
    textArea: { height: 80, textAlignVertical: 'top' },
    button: { padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 15 },
    approveButton: { backgroundColor: '#28a745' }, // Verde
    rejectButton: { backgroundColor: '#dc3545' }, // Vermelho
    buttonDisabled: { backgroundColor: '#a7c7e7' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
});

export default AprovacaoDetailScreen;