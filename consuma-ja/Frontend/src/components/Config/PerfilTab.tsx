import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useConfig } from '../../contexts/ConfigContext/configContext';

export const PerfilTab = () => {
  const { nome, email, telefone, tipoUsuario, cpf, cnpj, fornecedorNum, loadingData, handleUpdatePerfilCompleto } = useConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });

  useEffect(() => {
    setFormData({
      nome: nome || '',
      email: email || '',
      telefone: telefone || ''
    });
  }, [nome, email, telefone]);

  const formatDocumento = (doc: string) => {
    const cleanDoc = doc.replace(/\D/g, '');

    if (cleanDoc.length === 11) {
      // Formatar CPF: 000.000.000-00
      return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleanDoc.length === 14) {
      // Formatar CNPJ: 00.000.000/0000-00
      return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    return doc;
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Erro', 'Email válido é obrigatório');
      return;
    }

    if (!formData.telefone.trim() || formData.telefone.replace(/\D/g, '').length < 10) {
      Alert.alert('Erro', 'Telefone válido é obrigatório');
      return;
    }

    try {
      await handleUpdatePerfilCompleto(formData.nome.trim(), formData.email.trim(), formData.telefone.trim());
      setIsEditing(false);
      Alert.alert('Sucesso', 'Dados atualizados com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar dados');
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: nome || '',
      email: email || '',
      telefone: telefone || ''
    });
    setIsEditing(false);
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
      <Text style={styles.title}>Informações Pessoais</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Nome</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.nome}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nome: text }))}
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
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
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
            onChangeText={(text) => setFormData(prev => ({ ...prev, telefone: text }))}
            placeholder="Digite seu telefone"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{telefone || 'Não informado'}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Tipo de Usuário</Text>
        <Text style={styles.value}>{tipoUsuario === 'Fisica' ? 'Pessoa Física' : tipoUsuario === 'Juridica' ? 'Pessoa Jurídica' : 'Admin'}</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Documento ({tipoUsuario === 'Fisica' ? 'CPF' : 'CNPJ'})</Text>
        <Text style={styles.value}>
          {tipoUsuario === 'Fisica' ? (cpf ? formatDocumento(cpf) : 'Não informado') : (cnpj ? formatDocumento(cnpj) : 'Não informado')}
        </Text>
      </View>

      {tipoUsuario === 'Juridica' && (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Número do Fornecedor</Text>
          <Text style={styles.value}>{fornecedorNum || 'Não informado'}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Editar</Text>
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
  value: {
    fontSize: 16,
    color: '#666',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  cancelButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});