import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Picker } from 'react-native';
import produtoService from '../services/produtoService';
import categoriaService from '../services/categoriaService';
import marcaService from '../services/marcaService';
import tipoService from '../services/tipoService';

function ProdutoForm() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const categoriasData = await categoriaService.listarCategorias();
      const marcasData = await marcaService.listarMarcas();
      const tiposData = await tipoService.listarTipos();
      setCategorias(categoriasData);
      setMarcas(marcasData);
      setTipos(tiposData);
    }
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      await produtoService.criarProduto({
        nome,
        descricao,
        preco,
        categoriaId,
        marcaId,
        tipoId,
      });
      alert('Produto criado com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao criar produto.');
    }
  };

  return (
    <View>
      <Text>Nome:</Text>
      <TextInput value={nome} onChangeText={setNome} />
      <Text>Descrição:</Text>
      <TextInput value={descricao} onChangeText={setDescricao} />
      <Text>Preço:</Text>
      <TextInput value={preco} onChangeText={setPreco} />
      <Text>Categoria:</Text>
      <Picker
        selectedValue={categoriaId}
        onValueChange={(itemValue) => setCategoriaId(itemValue)}
      >
        {categorias.map((categoria) => (
          <Picker.Item
            key={categoria.categoria_id}
            label={categoria.categoria_nome}
            value={categoria.categoria_id}
          />
        ))}
      </Picker>
      <Text>Marca:</Text>
      <Picker
        selectedValue={marcaId}
        onValueChange={(itemValue) => setMarcaId(itemValue)}
      >
        {marcas.map((marca) => (
          <Picker.Item
            key={marca.marca_id}
            label={marca.marca_nome}
            value={marca.marca_id}
          />
        ))}
      </Picker>
      <Text>Tipo:</Text>
      <Picker
        selectedValue={tipoId}
        onValueChange={(itemValue) => setTipoId(itemValue)}
      >
        {tipos.map((tipo) => (
          <Picker.Item
            key={tipo.tipo_id}
            label={tipo.tipo_nome}
            value={tipo.tipo_id}
          />
        ))}
      </Picker>
      <Button title="Criar Produto" onPress={handleSubmit} />
    </View>
  );
}

export default ProdutoForm;