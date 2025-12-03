import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useConfig } from '../../contexts/ConfigContext/configContext';

const maskDocumento = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');

  if (cleanValue.length === 11) {
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  if (cleanValue.length === 14) {
    return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return value;
};

export const PerfilTab: React.FC = () => {
  const {
    nome,
    email,
    telefone,
    tipoUsuario,
    cpf,
    cnpj,
    fornecedorNum,
    loadingData,
    handleUpdatePerfilCompleto,
  } = useConfig();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '' });

  useEffect(() => {
    setFormData({ nome: nome || '', email: email || '', telefone: telefone || '' });
  }, [nome, email, telefone]);

  const handleChange = (field: 'nome' | 'email' | 'telefone', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData({ nome: nome || '', email: email || '', telefone: telefone || '' });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Erro', 'Email válido é obrigatório.');
      return;
    }

    if (!formData.telefone.trim() || formData.telefone.replace(/\D/g, '').length < 10) {
      Alert.alert('Erro', 'Telefone válido é obrigatório.');
      return;
    }

    try {
      await handleUpdatePerfilCompleto(formData.nome.trim(), formData.email.trim(), formData.telefone.trim());
      setIsEditing(false);
      Alert.alert('Sucesso', 'Dados atualizados com sucesso.');
    } catch (error) {
      console.error('[PerfilTab] Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Falha ao atualizar dados.');
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

  const documentoLabel = tipoUsuario === 'Fisica' ? 'CPF' : tipoUsuario === 'Juridica' ? 'CNPJ' : 'Documento';
  const documentoValue = tipoUsuario === 'Fisica' ? cpf : tipoUsuario === 'Juridica' ? cnpj : '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações Pessoais</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Nome</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.nome}
            onChangeText={(value) => handleChange('nome', value)}
            placeholder="Digite seu nome"
          />
        ) : (
          <Text style={styles.value}>{nome || 'Não informado'}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="Digite seu email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        ) : (
          <Text style={styles.value}>{email || 'Não informado'}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Telefone</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.telefone}
            onChangeText={(value) => handleChange('telefone', value)}
            placeholder="Digite seu telefone"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{telefone || 'Não informado'}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Tipo de Usuário</Text>
        <Text style={styles.value}>
          {tipoUsuario === 'Fisica' ? 'Pessoa Física' : tipoUsuario === 'Juridica' ? 'Pessoa Jurídica' : 'Admin'}
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Documento ({documentoLabel})</Text>
        <Text style={styles.value}>{documentoValue ? maskDocumento(documentoValue) : 'Não informado'}</Text>
      </View>

      {tipoUsuario === 'Juridica' && (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Número do Fornecedor</Text>
          <Text style={styles.value}>{fornecedorNum || 'Não informado'}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        {isEditing ? (
          <>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
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
  value: {
    fontSize: 16,
    color: '#555',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
