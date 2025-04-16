import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import tipoService from '../services/tipoService';

function TipoForm() {
  const [nome, setNome] = useState('');

  const handleSubmit = async () => {
    try {
      await tipoService.criarTipo({ nome });
      alert('Tipo criado com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao criar tipo.');
    }
  };

  return (
    <View>
      <Text>Nome:</Text>
      <TextInput value={nome} onChangeText={setNome} />
      <Button title="Criar Tipo" onPress={handleSubmit} />
    </View>
  );
}

export default TipoForm;