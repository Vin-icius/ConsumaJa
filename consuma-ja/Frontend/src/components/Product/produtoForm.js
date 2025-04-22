// produtoForm.js - Mover para src/components/Product/ProdutoForm.js seria ideal
import React, { useState, useEffect } from 'react';
// <<< CORREÇÃO IMPORT Picker >>>
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // <<< Importado do pacote correto

// Assumindo que os serviços retornam os dados corretamente
// Idealmente, os serviços também deveriam ter tratamento de erro e retornar os dados aninhados (ex: response.data)
import produtoService from '../../services/produtoService';
import categoriaService from '../../services/categoriaService';
import marcaService from '../../services/marcaService';
import tipoService from '../../services/tipoService';

function ProdutoForm({ onSubmitSuccess }) { // Adicionar prop para callback opcional
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState(''); // Manter como string para input, converter ao enviar
  const [categoriaId, setCategoriaId] = useState(null); // Usar null para placeholder
  const [marcaId, setMarcaId] = useState(null);
  const [tipoId, setTipoId] = useState(null);

  // Estados para as listas dos Pickers
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [tipos, setTipos] = useState([]);

  // Estados de controle
  const [loadingLists, setLoadingLists] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorLists, setErrorLists] = useState(null);

  // Buscar dados para os Pickers
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoadingLists(true);
      setErrorLists(null);
      try {
        // Executar buscas em paralelo
        const [catResponse, marResponse, tipResponse] = await Promise.all([
          categoriaService.listarCategorias(),
          marcaService.listarMarcas(),
          tipoService.listarTipos()
        ]);

        // Assumindo que seus serviços retornam { data: [...] } como axios
        if (isMounted) {
            setCategorias(catResponse?.data || []); // Acessar .data e garantir array
            setMarcas(marResponse?.data || []);
            setTipos(tipResponse?.data || []);
        }

      } catch (error) {
        console.error("Erro ao buscar dados para formulário:", error);
         if (isMounted) {
            setErrorLists("Erro ao carregar opções (Categorias/Marcas/Tipos).");
            // Poderia mostrar um Alert também
            // Alert.alert("Erro", "Não foi possível carregar as opções para o formulário.");
         }
      } finally {
         if (isMounted) setLoadingLists(false);
      }
    }
    fetchData();
    return () => { isMounted = false }; // Cleanup
  }, []); // Roda apenas uma vez ao montar

  // Validação simples (pode ser mais robusta)
  const validateForm = () => {
      if (!nome.trim()) return "Nome do produto é obrigatório.";
      if (!preco.trim() || isNaN(Number(preco)) || Number(preco) <= 0) return "Preço inválido.";
      if (!categoriaId) return "Selecione uma Categoria.";
      if (!marcaId) return "Selecione uma Marca.";
      if (!tipoId) return "Selecione um Tipo.";
      return null; // Sem erros
  }

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
        Alert.alert("Erro de Validação", validationError);
        return;
    }

    setLoadingSubmit(true);
    try {
      // Converter tipos antes de enviar
      const produtoData = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco: Number(preco), // Converte preço para número
        categoriaId: Number(categoriaId), // Garante que ID seja número
        marcaId: Number(marcaId),       // Garante que ID seja número
        tipoId: Number(tipoId),         // Garante que ID seja número
        // Adicionar outros campos necessários pela API de produto (ex: medida, status inicial?)
        // produto_medida: 'Unidade', // Exemplo
        // produto_status: 'PENDENTE', // Exemplo
      };

      // Chamar serviço para criar
      const response = await produtoService.criarProduto(produtoData);
      // console.log("Produto criado:", response.data); // Verificar resposta se necessário
      Alert.alert('Sucesso!', 'Produto criado com sucesso.');
      // Limpar formulário ou chamar callback
      setNome('');
      setDescricao('');
      setPreco('');
      setCategoriaId(null);
      setMarcaId(null);
      setTipoId(null);
      if (onSubmitSuccess) onSubmitSuccess(); // Chama callback se fornecido

    } catch (error) {
      console.error("Erro ao criar produto:", error);
      const message = error.response?.data?.message || error.message || 'Erro desconhecido ao criar produto.';
      Alert.alert('Erro', message);
    } finally {
        setLoadingSubmit(false);
    }
  };

  // Função auxiliar para renderizar Picker com loading/erro/placeholder
  const renderPicker = (label, selectedValue, onValueChange, items, keyProp, labelProp, errorMsg) => {
     if (loadingLists) return <ActivityIndicator size="small" />;
     // if (errorMsg) return <Text style={styles.errorText}>{errorMsg}</Text>; // Mostra erro se houver

     // Verificar se items é um array válido
     const validItems = Array.isArray(items) ? items : [];

     return (
         <View style={styles.pickerContainer}>
            <Picker
                selectedValue={selectedValue}
                onValueChange={(itemValue, itemIndex) => {
                     // Converte para número ou null (se for o placeholder)
                     const numericValue = itemIndex === 0 ? null : Number(itemValue);
                     onValueChange(numericValue);
                }}
                style={styles.picker}
                prompt={`Selecione ${label}`} // Título no Android
            >
                 <Picker.Item label={`-- Selecione ${label} --`} value={null} style={styles.pickerPlaceholder}/>
                 {validItems.map((item) => (
                    <Picker.Item
                        key={item[keyProp]} // Usa a chave primária real (ex: categoria_id)
                        label={item[labelProp]} // Usa a propriedade do nome (ex: categoria_nome)
                        value={item[keyProp]} // Usa a chave primária real (ex: categoria_id)
                    />
                 ))}
            </Picker>
         </View>
     );
  }

  return (
    // Adicionar ScrollView se o formulário for longo
    <View style={styles.container}>
        <Text style={styles.label}>Nome:</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome do Produto" />

        <Text style={styles.label}>Descrição:</Text>
        <TextInput style={[styles.input, styles.textArea]} value={descricao} onChangeText={setDescricao} placeholder="Descrição detalhada" multiline />

        <Text style={styles.label}>Preço (R$):</Text>
        <TextInput style={styles.input} value={preco} onChangeText={setPreco} placeholder="Ex: 10.99" keyboardType="numeric" />

        <Text style={styles.label}>Categoria:</Text>
        {renderPicker('uma Categoria', categoriaId, setCategoriaId, categorias, 'categoria_id', 'categoria_nome', errorLists)}

        <Text style={styles.label}>Marca:</Text>
         {renderPicker('uma Marca', marcaId, setMarcaId, marcas, 'marca_id', 'marca_nome', errorLists)}

        <Text style={styles.label}>Tipo:</Text>
         {renderPicker('um Tipo', tipoId, setTipoId, tipos, 'tipo_id', 'tipo_nome', errorLists)}

         {/* Mostrar erro geral de carregamento das listas */}
         {errorLists && <Text style={styles.errorText}>{errorLists}</Text>}

        <View style={styles.buttonContainer}>
            <Button
                title={loadingSubmit ? "Criando..." : "Criar Produto"}
                onPress={handleSubmit}
                disabled={loadingSubmit || loadingLists} // Desabilita se estiver carregando listas ou enviando
                color="#28a745" // Cor verde
            />
        </View>

    </View>
  );
}

// Adicionar alguns estilos básicos
const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#fff', // Fundo branco para formulário
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 15,
        borderRadius: 5,
        fontSize: 15,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        height: 80, // Altura maior para descrição
        textAlignVertical: 'top', // Alinha texto no topo em Android
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    picker: {
        height: 50,
    },
     pickerPlaceholder: {
         color: 'grey'
     },
    buttonContainer: {
        marginTop: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
});


export default ProdutoForm;