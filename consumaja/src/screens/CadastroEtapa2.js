import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const CadastroEtapa2 = ({ route, navigation }) => {
  const { formData } = route.params;
  const [documento, setDocumento] = useState('');
  const [selfie, setSelfie] = useState(null);
  const [documentoFoto, setDocumentoFoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFinalizando, setIsFinalizando] = useState(false);

  const handlePickImage = async (setImage) => {
    let result = await ImagePicker.launchCameraAsync({ base64: true });
    if (!result.canceled) {
      setImage(result.uri);
      Alert.alert('Foto capturada!', 'Imagem salva com sucesso.');
    }
  };

  const validarCampos = () => {
    let newErrors = {};
    if (documento.length < 11) newErrors.documento = 'CPF/CNPJ inválido';
    if (!selfie) newErrors.selfie = 'Selfie obrigatória';
    if (!documentoFoto) newErrors.documentoFoto = 'Documento obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinalizar = () => {
    if (!validarCampos()) return;
    setIsFinalizando(true);
    
    setTimeout(() => {
      setIsFinalizando(false);
      Alert.alert('Cadastro Concluído!', 'Seu cadastro foi realizado com sucesso.');
      navigation.navigate('Login');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Etapa 2</Text>
      <TextInput
        style={[styles.input, errors.documento ? styles.inputError : null]}
        placeholder="CPF ou CNPJ"
        keyboardType="numeric"
        value={documento}
        onChangeText={setDocumento}
      />
      {errors.documento && <Text style={styles.errorText}>{errors.documento}</Text>}
      
      <Text>Validar Identidade</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={() => handlePickImage(setSelfie)}>
        <Text>Capturar Selfie</Text>
      </TouchableOpacity>
      {selfie && <Image source={{ uri: selfie }} style={styles.image} />}
      {errors.selfie && <Text style={styles.errorText}>{errors.selfie}</Text>}

      <Text>Validar Documento</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={() => handlePickImage(setDocumentoFoto)}>
        <Text>Capturar Documento</Text>
      </TouchableOpacity>
      {documentoFoto && <Image source={{ uri: documentoFoto }} style={styles.image} />}
      {errors.documentoFoto && <Text style={styles.errorText}>{errors.documentoFoto}</Text>}

      <TouchableOpacity
        style={[styles.finalizarButton, (!selfie || !documentoFoto || isFinalizando) ? styles.disabledButton : {}]}
        onPress={handleFinalizar}
        disabled={!selfie || !documentoFoto || isFinalizando}
      >
        <Text style={styles.buttonText}>{isFinalizando ? 'Finalizando...' : 'Finalizar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', fontSize: 12, marginBottom: 5 },
  imagePicker: { backgroundColor: '#ddd', padding: 10, marginBottom: 10, alignItems: 'center', borderRadius: 5 },
  image: { width: 100, height: 100, alignSelf: 'center', marginBottom: 10 },
  finalizarButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 5, alignItems: 'center' },
  disabledButton: { backgroundColor: '#aaa' },
  buttonText: { color: 'white', fontSize: 16 },
});

export default CadastroEtapa2;
