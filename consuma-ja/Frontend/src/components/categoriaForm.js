import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import categoriaService from '../services/categoriaService';

function CategoriaForm() {
  const [nome, setNome] = useState('');

  const handleSubmit = async () => {
    try {
      await categoriaService.criarCategoria({ nome });
      alert('Categoria criada com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao criar categoria.');
    }
  };

  return (
    <View>
      <Text>Nome:</Text>
      <TextInput value={nome} onChangeText={setNome} />
      <Button title="Criar Categoria" onPress={handleSubmit} />
    </View>
  );
}

export default CategoriaForm;