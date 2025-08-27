import { Platform, StyleSheet } from "react-native";

export const userListStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f8f0",
    paddingBottom: Platform.OS === "ios" ? 0 : 10, // Adiciona padding extra para Android
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f8f0",
  },
  header: {
    backgroundColor: "#28a745", // Verde para o cabeçalho
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 5,
    fontWeight: "500",
  },
  picker: {
    height: 50,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    color: "#495057",
  },
  clearFiltersButton: {
    backgroundColor: "#6c757d",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    marginTop: 20, // Alinha com os pickers
  },
  buttonIcon: {
    marginRight: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e9f7ef", // Verde claro para o cabeçalho da tabela
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  tableHeaderCell: {
    fontWeight: "bold",
    color: "#212529",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  tableCellContainer: {
    justifyContent: "center",
  },
  tableCellText: {
    fontSize: 14,
    color: "#495057",
  },
  emptyTableRow: {
    padding: 20,
    alignItems: "center",
  },
  emptyTableText: {
    color: "#6c757d",
    fontSize: 16,
    textAlign: "center",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusActiveBadge: {
    backgroundColor: "#d4edda",
  },
  statusInactiveBadge: {
    backgroundColor: "#f8d7da",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusActiveText: {
    color: "#155724",
  },
  statusInactiveText: {
    color: "#721c24",
  },
  actionButtons: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#ffc107",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
  },
  paginationButton: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#28a745",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  paginationButtonActive: {
    backgroundColor: "#218838",
  },
  paginationButtonDisabled: {
    backgroundColor: "#e9ecef",
  },
  paginationButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  paginationButtonTextActive: {
    color: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  loadingText: {
    marginTop: 10,
    color: "#6c757d",
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  paginationWrapper: {
    paddingBottom: Platform.OS === "ios" ? 20 : 10, // Espaço extra na parte inferior
  },
  mobileList: {
    padding: 10,
    paddingBottom: 20, // Espaço extra no final da lista
  },
  mobileCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  mobileCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  mobileCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    flex: 1,
  },
  mobileCardContent: {
    flexDirection: "row",
    marginBottom: 6,
  },
  mobileCardLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6c757d",
    width: 80,
  },
  mobileCardValue: {
    fontSize: 14,
    color: "#212529",
    flex: 1,
  },
  mobileCardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 8,
    backgroundColor: "#007bff",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
})