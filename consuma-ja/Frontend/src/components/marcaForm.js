import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import marcaService from '../services/marcaService';

function MarcaForm() {
  const [nome, setNome] = useState('');

  const handleSubmit = async () => {
    try {
      await marcaService.criarMarca({ nome });
      alert('Marca criada com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao criar marca.');
    }
  };

  return (
    <View>
      <Text>Nome:</Text>
      <TextInput value={nome} onChangeText={setNome} />
      <Button title="Criar Marca" onPress={handleSubmit} />
    </View>
  );
}

export default MarcaForm;