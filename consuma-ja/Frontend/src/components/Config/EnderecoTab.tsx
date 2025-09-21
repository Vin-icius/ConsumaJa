import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { useConfig } from '../../contexts/ConfigContext/configContext';

export const EnderecoTab = () => {
  const {
    cep,
    setCep,
    rua,
    setRua,
    numero,
    setNumero,
    complemento,
    setComplemento,
    bairro,
    setBairro,
    cidade,
    setCidade,
    estado,
    setEstado,
    loadingData,
    loadingSubmit,
    loadingCep,
    errors,
    handleCepBlur,
    handleSubmitEndereco,
    clearErrors
  } = useConfig();

  const handleCepChange = (text: string) => {
    // Formatar CEP: 00000-000
    const formatted = text.replace(/\D/g, '').replace(/(\d{5})(\d{1,3})/, '$1-$2');
    setCep(formatted);
    if (errors.cep) {
      clearErrors();
    }
  };

  const handleSubmit = () => {
    handleSubmitEndereco();
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Endereço</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>CEP</Text>
        <TextInput
          style={[styles.input, errors.cep && styles.inputError]}
          value={cep}
          onChangeText={handleCepChange}
          onBlur={handleCepBlur}
          placeholder="00000-000"
          keyboardType="numeric"
          maxLength={9}
          editable={!loadingCep}
        />
        {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}
        {loadingCep && (
          <View style={styles.loadingCepContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingCepText}>Buscando CEP...</Text>
          </View>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Rua</Text>
        <TextInput
          style={[styles.input, errors.rua && styles.inputError]}
          value={rua}
          onChangeText={(text) => {
            setRua(text);
            if (errors.rua) clearErrors();
          }}
          placeholder="Nome da rua"
        />
        {errors.rua && <Text style={styles.errorText}>{errors.rua}</Text>}
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Número</Text>
          <TextInput
            style={[styles.input, errors.numero && styles.inputError]}
            value={numero}
            onChangeText={(text) => {
              setNumero(text);
              if (errors.numero) clearErrors();
            }}
            placeholder="123"
            keyboardType="numeric"
          />
          {errors.numero && <Text style={styles.errorText}>{errors.numero}</Text>}
        </View>

        <View style={[styles.fieldContainer, { flex: 2 }]}>
          <Text style={styles.label}>Complemento</Text>
          <TextInput
            style={styles.input}
            value={complemento}
            onChangeText={setComplemento}
            placeholder="Apto, bloco, etc. (opcional)"
          />
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Bairro</Text>
        <TextInput
          style={[styles.input, errors.bairro && styles.inputError]}
          value={bairro}
          onChangeText={(text) => {
            setBairro(text);
            if (errors.bairro) clearErrors();
          }}
          placeholder="Nome do bairro"
        />
        {errors.bairro && <Text style={styles.errorText}>{errors.bairro}</Text>}
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.fieldContainer, { flex: 2, marginRight: 10 }]}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={[styles.input, errors.cidade && styles.inputError]}
            value={cidade}
            onChangeText={(text) => {
              setCidade(text);
              if (errors.cidade) clearErrors();
            }}
            placeholder="Nome da cidade"
          />
          {errors.cidade && <Text style={styles.errorText}>{errors.cidade}</Text>}
        </View>

        <View style={[styles.fieldContainer, { flex: 1 }]}>
          <Text style={styles.label}>Estado</Text>
          <TextInput
            style={[styles.input, errors.estado && styles.inputError]}
            value={estado}
            onChangeText={(text) => {
              setEstado(text);
              if (errors.estado) clearErrors();
            }}
            placeholder="UF"
            maxLength={2}
            autoCapitalize="characters"
          />
          {errors.estado && <Text style={styles.errorText}>{errors.estado}</Text>}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loadingSubmit && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={loadingSubmit}
      >
        {loadingSubmit ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar Endereço</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  loadingCepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  loadingCepText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});