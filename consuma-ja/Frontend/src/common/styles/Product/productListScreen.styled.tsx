import { Platform, StyleSheet } from "react-native";

export const productListStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Cor de fundo geral da tela
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12, // Ajustado
    backgroundColor: "#fff", // Fundo branco para o header
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0", // Linha sutil
  },
  title: {
    fontSize: 20, // Ajustado
    fontWeight: "bold",
    color: "#343a40",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745", // Verde para adicionar
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6, // Bordas mais suaves
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 6,
    fontSize: 14,
  },
  filtersContainer: {
    padding: 12, // Padding ajustado
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 0, // Remover margem se a FlatList tiver paddingTop
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 12, // Espaço abaixo da busca
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f1f3f5", // Fundo suave para input
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8, // Ajuste de padding para altura
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#495057',
  },
  searchButton: {
    backgroundColor: "#007bff", // Azul para busca
    paddingHorizontal: 12, // Ajustado
    borderRadius: 6,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    // height: 44, // Altura definida pelo padding do input
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center', // Para alinhar o Picker no Android
    height: 44, // Altura consistente
  },
  pickerWrapperMargin: { // Adiciona margem se houver mais de um picker na linha
    marginRight: 8,
  },
  picker: {
    height: 44, // Altura consistente
    width: '100%',
    // No Android, o Picker dentro de uma View com altura pode precisar de ajustes
    // ou usar um componente de Picker customizado para melhor estilo.
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  clearFiltersText: {
    color: "#6c757d", // Cinza mais escuro
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 12, // Padding para os cards
    paddingTop: 10, // Espaço acima do primeiro card
    paddingBottom: 20, // Espaço abaixo do último card
  },
  produtoCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15, // Padding interno do card
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef", // Borda mais suave
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  produtoInativo: {
    opacity: 0.6,
    backgroundColor: '#f8f9fa', // Fundo diferente para inativos
  },
  produtoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Alinha ao topo para nomes longos
    marginBottom: 10,
  },
  produtoNome: {
    fontSize: 17, // Ajustado
    fontWeight: "600", // Um pouco menos bold
    color: "#343a40",
    flex: 1, // Para permitir quebra de linha e ocupar espaço
    marginRight: 10,
  },
  produtoActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 6, // Área de toque maior
    marginLeft: 10, // Espaço entre botões
  },
  produtoInfo: {
    borderTopWidth: 1,
    borderTopColor: "#f1f3f5", // Linha divisória mais suave
    paddingTop: 10,
  },
  infoLabel: {
    fontWeight: "500",
    color: "#495057",
  },
  produtoPreco: {
    fontSize: 15,
    color: "#28a745", // Verde para preço
    fontWeight: 'bold',
    marginBottom: 5,
  },
  produtoStatus: {
    fontSize: 13,
    color: "#6c757d",
    marginBottom: 3,
    textTransform: "capitalize",
  },
  statusAprovado: { color: 'green' },
  statusPendente: { color: '#ffc107' },
  statusRejeitado: { color: '#dc3545' },
  produtoDetalhe: { // Estilo genérico para Categoria, Marca, Tipo
    fontSize: 13,
    color: "#6c757d",
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1, // Para ocupar espaço se a lista estiver vazia mas o header estiver presente
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyContainerCentralized: { // Usado quando a lista é o único conteúdo
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center'
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
  emptySubText: {
      fontSize: 14,
      color: "#adb5bd",
      textAlign: "center",
      marginTop: 4,
  },
  loadingOverlay: { // Para loading de ações como delete
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)", // Overlay mais suave
  },
  centeredLoading: { // Para o loading inicial da tela inteira
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  retryButton: {
      marginTop: 20,
      backgroundColor: '#007bff',
      paddingVertical: 10,
      paddingHorizontal: 25,
      borderRadius: 5,
  },
  retryButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '500',
  },
  centeredMessageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      marginTop: 20,
  },
  errorText: {
      color: "#dc3545",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
      marginTop: 16,
      marginBottom: 8,
  }
});