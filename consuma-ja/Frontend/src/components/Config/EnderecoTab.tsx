import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useConfig } from '../../contexts/ConfigContext/configContext';

const formatCep = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 5) {
    return cleanValue;
  }
  return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`;
};

export const EnderecoTab: React.FC = () => {
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
    clearErrors,
  } = useConfig();

  const handleCepChange = (value: string) => {
    setCep(formatCep(value));
    if (errors.cep) {
      clearErrors();
    }
  };

  const handleChange = (setter: (value: string) => void, field: string, value: string) => {
    setter(value);
    if (errors[field]) {
      clearErrors();
    }
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
        <View style={styles.cepRow}>
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
          {loadingCep && <ActivityIndicator size="small" color="#007AFF" style={styles.cepLoader} />}
        </View>
        {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Rua</Text>
        <TextInput
          style={[styles.input, errors.rua && styles.inputError]}
          value={rua}
          onChangeText={(value) => handleChange(setRua, 'rua', value)}
          placeholder="Nome da rua"
        />
        {errors.rua && <Text style={styles.errorText}>{errors.rua}</Text>}
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldContainer, styles.flexOne, styles.marginRight]}>
          <Text style={styles.label}>Número</Text>
          <TextInput
            style={[styles.input, errors.numero && styles.inputError]}
            value={numero}
            onChangeText={(value) => handleChange(setNumero, 'numero', value)}
            placeholder="Número"
            keyboardType="numeric"
          />
          {errors.numero && <Text style={styles.errorText}>{errors.numero}</Text>}
        </View>

        <View style={[styles.fieldContainer, styles.flexOne]}>
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
          onChangeText={(value) => handleChange(setBairro, 'bairro', value)}
          placeholder="Bairro"
        />
        {errors.bairro && <Text style={styles.errorText}>{errors.bairro}</Text>}
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldContainer, styles.flexTwo, styles.marginRight]}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={[styles.input, errors.cidade && styles.inputError]}
            value={cidade}
            onChangeText={(value) => handleChange(setCidade, 'cidade', value)}
            placeholder="Cidade"
          />
          {errors.cidade && <Text style={styles.errorText}>{errors.cidade}</Text>}
        </View>

        <View style={[styles.fieldContainer, styles.flexOne]}>
          <Text style={styles.label}>Estado</Text>
          <TextInput
            style={[styles.input, errors.estado && styles.inputError]}
            value={estado}
            onChangeText={(value) => handleChange(setEstado, 'estado', value)}
            placeholder="UF"
            maxLength={2}
            autoCapitalize="characters"
          />
          {errors.estado && <Text style={styles.errorText}>{errors.estado}</Text>}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loadingSubmit && styles.buttonDisabled]}
        onPress={handleSubmitEndereco}
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
  cepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cepLoader: {
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flexOne: {
    flex: 1,
  },
  flexTwo: {
    flex: 2,
  },
  marginRight: {
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
