import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { useConfig } from '../../contexts/ConfigContext/configContext';

export const PagamentoTab = () => {
  const {
    metodosPagamento,
    novoMetodoPagamento,
    setNovoMetodoPagamento,
    loadingData,
    loadingSubmit,
    handleAdicionarMetodoPagamento,
    handleRemoverMetodoPagamento,
    errors
  } = useConfig();

  const [showAddCard, setShowAddCard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const formatCardNumber = (text: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = text.replace(/\D/g, '');
    // Adiciona espaços a cada 4 dígitos
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiryDate = (text: string) => {
    // Remove caracteres não numéricos
    const cleaned = text.replace(/\D/g, '');
    // Adiciona barra após 2 dígitos
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard';
    if (cleaned.startsWith('3')) return 'American Express';
    return 'Cartão';
  };

  const maskCardNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      return '**** **** **** ' + cleaned.slice(-4);
    }
    return number;
  };

  const handleAddCard = () => {
    handleAdicionarMetodoPagamento();
    setShowAddCard(false);
  };

  const handleRemoveCard = (pagamentoId: number) => {
    console.log('handleRemoveCard chamado com ID:', pagamentoId);
    handleRemoverMetodoPagamento(pagamentoId);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Métodos de Pagamento</Text>
      <Text style={styles.subtitle}>
        Gerencie seus cartões de crédito e débito
      </Text>

      {/* Botões de ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddCard(true)}
        >
          <Text style={styles.addButtonText}>+ Adicionar Cartão</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setShowHistory(true)}
        >
          <Text style={styles.historyButtonText}>Histórico</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de cartões */}
      <View style={styles.cardsSection}>
        <Text style={styles.sectionTitle}>Seus Cartões</Text>

        {metodosPagamento.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>Nenhum cartão cadastrado</Text>
            <Text style={styles.emptyText}>
              Adicione um cartão para facilitar suas compras
            </Text>
          </View>
        ) : (
          metodosPagamento.map((metodo: any) => (
            <View key={metodo.id} style={styles.cardItem}>
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardType}>{getCardType(metodo.numero_cartao)}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveCard(metodo.id)}
                  >
                    <Text style={styles.removeButtonText}>Remover</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardNumber}>
                  {maskCardNumber(metodo.numero_cartao)}
                </Text>
                <Text style={styles.cardName}>{metodo.nome_cartao}</Text>
                <Text style={styles.cardExpiry}>
                  Válido até: {metodo.data_validade}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Modal para adicionar cartão */}
      <Modal
        visible={showAddCard}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddCard(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Novo Cartão</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Número do Cartão</Text>
              <TextInput
                style={[styles.input, errors.numero_cartao && styles.inputError]}
                value={novoMetodoPagamento.numero_cartao}
                onChangeText={(text) => setNovoMetodoPagamento({
                  ...novoMetodoPagamento,
                  numero_cartao: formatCardNumber(text)
                })}
                placeholder="0000 0000 0000 0000"
                keyboardType="numeric"
                maxLength={19}
              />
              {errors.numero_cartao && <Text style={styles.errorText}>{errors.numero_cartao}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nome no Cartão</Text>
              <TextInput
                style={[styles.input, errors.nome_cartao && styles.inputError]}
                value={novoMetodoPagamento.nome_cartao}
                onChangeText={(text) => setNovoMetodoPagamento({
                  ...novoMetodoPagamento,
                  nome_cartao: text
                })}
                placeholder="Como está escrito no cartão"
                autoCapitalize="characters"
              />
              {errors.nome_cartao && <Text style={styles.errorText}>{errors.nome_cartao}</Text>}
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Data de Validade</Text>
                <TextInput
                  style={[styles.input, errors.data_validade && styles.inputError]}
                  value={novoMetodoPagamento.data_validade}
                  onChangeText={(text) => setNovoMetodoPagamento({
                    ...novoMetodoPagamento,
                    data_validade: formatExpiryDate(text)
                  })}
                  placeholder="MM/AA"
                  keyboardType="numeric"
                  maxLength={5}
                />
                {errors.data_validade && <Text style={styles.errorText}>{errors.data_validade}</Text>}
              </View>

              <View style={[styles.fieldContainer, { flex: 1 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={[styles.input, errors.cvv && styles.inputError]}
                  value={novoMetodoPagamento.cvv}
                  onChangeText={(text) => setNovoMetodoPagamento({
                    ...novoMetodoPagamento,
                    cvv: text.replace(/\D/g, '')
                  })}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
                {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setShowAddCard(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveModalButton, loadingSubmit && styles.buttonDisabled]}
                onPress={handleAddCard}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveModalButtonText}>Adicionar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para histórico */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Histórico de Pagamentos</Text>

            <ScrollView style={styles.historyList}>
              {/* TODO: Implementar busca de histórico real */}
              <View style={styles.historyItem}>
                <Text style={styles.historyDate}>15/12/2024</Text>
                <Text style={styles.historyDescription}>Compra - Restaurante do João</Text>
                <Text style={styles.historyAmount}>R$ 45,90</Text>
                <Text style={styles.historyStatus}>Aprovado</Text>
              </View>

              <View style={styles.historyItem}>
                <Text style={styles.historyDate}>10/12/2024</Text>
                <Text style={styles.historyDescription}>Compra - Lanchonete Central</Text>
                <Text style={styles.historyAmount}>R$ 23,50</Text>
                <Text style={styles.historyStatus}>Aprovado</Text>
              </View>

              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>
                  Histórico completo em breve...
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeHistoryButton}
              onPress={() => setShowHistory(false)}
            >
              <Text style={styles.closeHistoryButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  historyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  historyButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  cardsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cardItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  cardName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 15,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelModalButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  cancelModalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  saveModalButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  saveModalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  historyDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 2,
  },
  historyStatus: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 20,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  closeHistoryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeHistoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});