import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext/authContext';
import { useConfig } from '../../contexts/ConfigContext/configContext';
import configService from '../../services/configService';
import { configStyles } from '../../common/styles/Core/configScreen.styled';

export const TwoFactorSettings: React.FC = () => {
  const {
    user,
    enableTwoFactor,
    disableTwoFactor,
    confirmTwoFactorSetup,
    isLoading,
  } = useAuth();

  const {
    autenticacao2FA,
    setAutenticacao2FA,
  } = useConfig();

  const [showSetup, setShowSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleEnableTwoFactor = async () => {
    try {
      setLoading(true);
      // Primeiro habilita o 2FA
      await enableTwoFactor();

      // Atualizar estado do ConfigContext
      setAutenticacao2FA(true);

      // Depois gera o QR code
      if (user?.pessoa_id) {
        const qrResponse = await configService.gerarQRCode2FA(user.pessoa_id);
        setQrCodeUrl(qrResponse.qr_code);
        setShowSetup(true);
      }
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Erro ao habilitar autenticação de dois fatores'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Erro', 'Digite um código de 6 dígitos');
      return;
    }

    try {
      setLoading(true);
      // Confirma a configuração com o código
      await confirmTwoFactorSetup(verificationCode);

      setShowSetup(false);
      setVerificationCode('');
      setQrCodeUrl('');
      Alert.alert('Sucesso', 'Autenticação de dois fatores habilitada com sucesso!');
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Código inválido. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTwoFactor = () => {
    Alert.alert(
      'Desabilitar 2FA',
      'Tem certeza que deseja desabilitar a autenticação de dois fatores? Isso reduzirá a segurança da sua conta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desabilitar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await disableTwoFactor();
              setAutenticacao2FA(false); // Atualizar estado do ConfigContext
              Alert.alert('Sucesso', 'Autenticação de dois fatores desabilitada');
            } catch (error: any) {
              Alert.alert(
                'Erro',
                error.message || 'Erro ao desabilitar autenticação de dois fatores'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelSetup = async () => {
    try {
      setLoading(true);
      // Desabilita a 2FA e limpa o código quando cancelar
      await disableTwoFactor();
      setAutenticacao2FA(false); // Atualizar estado do ConfigContext

      setShowSetup(false);
      setVerificationCode('');
      setQrCodeUrl('');
    } catch (error: any) {
      console.error('Erro ao desabilitar 2FA ao cancelar:', error);
      // Mesmo com erro, fecha a tela e limpa os estados
      setShowSetup(false);
      setVerificationCode('');
      setQrCodeUrl('');
    } finally {
      setLoading(false);
    }
  };

  if (showSetup) {
    return (
      <ScrollView style={configStyles.scrollContainer}>
        <View style={configStyles.container}>
          <Text style={configStyles.sectionTitle}>Configurar Autenticação de Dois Fatores</Text>

          <View style={[configStyles.container, { backgroundColor: '#f0f8ff', padding: 15, marginBottom: 15, borderRadius: 8 }]}>
            <Ionicons name="information-circle-outline" size={24} color="#4CAF50" />
            <Text style={[configStyles.label, { marginTop: 10 }]}>
              1. Instale um aplicativo autenticador (Google Authenticator, Authy, etc.){'\n'}
              2. Escaneie o código QR abaixo{'\n'}
              3. Digite o código de 6 dígitos gerado pelo aplicativo
            </Text>
          </View>

          {qrCodeUrl && (
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <Text style={configStyles.label}>Escaneie o código QR:</Text>
              <Image
                source={{ uri: qrCodeUrl }}
                style={{ width: 200, height: 200, marginTop: 10 }}
                resizeMode="contain"
              />
            </View>
          )}

          <View style={configStyles.inputGroup}>
            <Text style={configStyles.label}>Código de Verificação:</Text>
            <TextInput
              style={configStyles.input}
              placeholder="000000"
              value={verificationCode}
              onChangeText={(text: string) => setVerificationCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
              maxLength={6}
              keyboardType="numeric"
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={[configStyles.button, configStyles.secondaryButton, { flex: 1, marginRight: 10 }]}
              onPress={handleCancelSetup}
              disabled={loading}
            >
              <Text style={configStyles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[configStyles.button, configStyles.saveButton, { flex: 1 }, loading && configStyles.buttonDisabled]}
              onPress={handleConfirmSetup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={configStyles.buttonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={configStyles.scrollContainer}>
      <View style={configStyles.container}>
        <Text style={configStyles.sectionTitle}>Autenticação de Dois Fatores</Text>

        <View style={[configStyles.rowContainer, { padding: 15, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 15 }]}>
          <View style={configStyles.rowContainer}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50" />
            <View style={{ marginLeft: 15 }}>
              <Text style={configStyles.label}>Status da 2FA</Text>
              <Text style={{ color: '#666', marginTop: 2 }}>
                {autenticacao2FA ? 'Habilitada' : 'Desabilitada'}
              </Text>
            </View>
          </View>

          <Ionicons
            name={autenticacao2FA ? "checkmark-circle" : "close-circle"}
            size={20}
            color={autenticacao2FA ? "#4CAF50" : "#e74c3c"}
          />
        </View>

        <View style={[configStyles.container, { backgroundColor: '#f0f8ff', padding: 15, marginBottom: 15, borderRadius: 8 }]}>
          <Ionicons name="information-circle-outline" size={20} color="#4CAF50" />
          <Text style={[configStyles.label, { marginTop: 10 }]}>
            A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta,
            exigindo um código gerado pelo seu telefone além da senha.
          </Text>
        </View>

        {!autenticacao2FA ? (
          <TouchableOpacity
            style={[configStyles.button, configStyles.saveButton, loading && configStyles.buttonDisabled]}
            onPress={handleEnableTwoFactor}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="shield-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={configStyles.buttonText}>Habilitar 2FA</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[configStyles.button, { backgroundColor: '#e74c3c' }, loading && configStyles.buttonDisabled]}
            onPress={handleDisableTwoFactor}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="shield-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={configStyles.buttonText}>Desabilitar 2FA</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};