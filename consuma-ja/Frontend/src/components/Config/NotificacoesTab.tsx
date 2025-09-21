import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { useConfig } from '../../contexts/ConfigContext/configContext';

export const NotificacoesTab = () => {
  const {
    emailNotificacoes,
    setEmailNotificacoes,
    smsNotificacoes,
    setSmsNotificacoes,
    marketingNotificacoes,
    setMarketingNotificacoes,
    loadingData,
    loadingSubmit,
    handleSubmitNotificacoes
  } = useConfig();

  const handleSubmit = () => {
    handleSubmitNotificacoes();
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
      <Text style={styles.title}>Preferências de Notificação</Text>
      <Text style={styles.subtitle}>
        Configure como você deseja receber notificações do aplicativo
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações por Email</Text>

        <View style={styles.switchContainer}>
          <View style={styles.switchItem}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Notificações Gerais</Text>
              <Text style={styles.switchDescription}>
                Receba emails sobre atualizações importantes, pedidos e suporte
              </Text>
            </View>
            <Switch
              value={emailNotificacoes}
              onValueChange={setEmailNotificacoes}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={emailNotificacoes ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações por SMS</Text>

        <View style={styles.switchContainer}>
          <View style={styles.switchItem}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Notificações por SMS</Text>
              <Text style={styles.switchDescription}>
                Receba mensagens de texto sobre pedidos urgentes e entregas
              </Text>
            </View>
            <Switch
              value={smsNotificacoes}
              onValueChange={setSmsNotificacoes}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={smsNotificacoes ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Marketing e Promoções</Text>

        <View style={styles.switchContainer}>
          <View style={styles.switchItem}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Ofertas e Promoções</Text>
              <Text style={styles.switchDescription}>
                Receba informações sobre ofertas especiais, novos produtos e promoções
              </Text>
            </View>
            <Switch
              value={marketingNotificacoes}
              onValueChange={setMarketingNotificacoes}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={marketingNotificacoes ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>💡 Dica</Text>
        <Text style={styles.infoText}>
          Você sempre receberá notificações importantes sobre seus pedidos,
          independentemente dessas configurações.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loadingSubmit && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={loadingSubmit}
      >
        {loadingSubmit ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar Preferências</Text>
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
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  switchContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
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