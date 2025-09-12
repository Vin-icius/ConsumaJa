import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

// Estilos inspirados e consistentes com userListScreen.styled.tsx
export const avaliacaoStyles = StyleSheet.create({
  // --- Container Principal (AvaliacaoList) ---
  container: {
    backgroundColor: '#fff', // Fundo branco para a seção, como os cards
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6', // Borda mais forte
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529', // Cor de texto primária
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f0f8f0', // Fundo da tela
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
  },
  
  // --- Botão "Avaliar" ---
  avaliarButton: {
    backgroundColor: '#28a745', // Cor primária verde
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    alignSelf: 'flex-start', // Para não ocupar a largura toda
  },
  avaliarButtonText: {
    color: '#fff',
    fontWeight: '500', // Padrão dos botões
    fontSize: 16,
    marginLeft: 8,
  },

  // --- Estatísticas (AvaliacaoStats) ---
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa', // Fundo levemente destacado
    borderRadius: 8,
  },
  statsMedia: {
    fontSize: 32, // Mais destaque
    fontWeight: 'bold',
    color: '#212529',
  },
  statsTotal: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },

  // --- Card de Avaliação (AvaliacaoCard) ---
  cardContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // Borda suave entre os cards
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardAuthor: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#212529',
  },
  cardDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  cardComentario: {
    fontSize: 14,
    color: '#495057', // Cor de texto sutil
    lineHeight: 21, // Melhor legibilidade
    marginTop: 8,
  },

  // --- Estrelas (Leitura e Input) ---
  estrelasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // --- Modal e Formulário (AvaliacaoFormModal) ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: width * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingBottom: 10,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  formLabel: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 10,
    fontWeight: '500',
  },
  inputComentario: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#6c757d', // Cinza secundário
  },
  submitButton: {
    backgroundColor: '#28a745', // Verde primário
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
});