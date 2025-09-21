import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useConfig } from '../../contexts/ConfigContext/configContext';
import { TwoFactorSettings } from './TwoFactorSettings';

export const SegurancaTab = () => {
  const {
    senhaAtual,
    setSenhaAtual,
    novaSenha,
    setNovaSenha,
    confirmarSenha,
    setConfirmarSenha,
    loadingData,
    loadingSubmit,
    handleSubmitSeguranca,
    errors
  } = useConfig();

  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleChangePassword = () => {
    handleSubmitSeguranca();
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
      <Text style={styles.title}>Segurança da Conta</Text>

      {/* Seção de Alteração de Senha */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowPasswordFields(!showPasswordFields)}
        >
          <Text style={styles.sectionTitle}>Alterar Senha</Text>
          <Text style={styles.toggleIcon}>{showPasswordFields ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {showPasswordFields && (
          <View style={styles.passwordFields}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Senha Atual</Text>
              <TextInput
                style={[styles.input, errors.senhaAtual && styles.inputError]}
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                placeholder="Digite sua senha atual"
                secureTextEntry
              />
              {errors.senhaAtual && <Text style={styles.errorText}>{errors.senhaAtual}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nova Senha</Text>
              <TextInput
                style={[styles.input, errors.novaSenha && styles.inputError]}
                value={novaSenha}
                onChangeText={setNovaSenha}
                placeholder="Digite a nova senha (mín. 6 caracteres)"
                secureTextEntry
              />
              {errors.novaSenha && <Text style={styles.errorText}>{errors.novaSenha}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirmar Nova Senha</Text>
              <TextInput
                style={[styles.input, errors.confirmarSenha && styles.inputError]}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                placeholder="Confirme a nova senha"
                secureTextEntry
              />
              {errors.confirmarSenha && <Text style={styles.errorText}>{errors.confirmarSenha}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.changePasswordButton, loadingSubmit && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={loadingSubmit}
            >
              {loadingSubmit ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.changePasswordButtonText}>Alterar Senha</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Seção de Autenticação 2FA */}
      <View style={styles.section}>
        <TwoFactorSettings />
      </View>

      {/* Seção de Segurança Geral */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dicas de Segurança</Text>

        <View style={styles.tipsContainer}>
          <View style={styles.tip}>
            <Text style={styles.tipText}>
              Use senhas fortes com pelo menos 8 caracteres, incluindo letras, números e símbolos.
            </Text>
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipText}>
              Ative a autenticação 2FA para proteger sua conta contra acessos não autorizados.
            </Text>
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipText}>
              Nunca compartilhe suas credenciais de login com terceiros.
            </Text>
          </View>
        </View>
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
  section: {
    marginBottom: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  toggleIcon: {
    fontSize: 16,
    color: '#666',
  },
  passwordFields: {
    marginTop: 10,
  },
  fieldContainer: {
    marginBottom: 15,
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
  changePasswordButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 10,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});