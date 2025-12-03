import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryText: {
    color: "#007bff",
    fontSize: 16,
    marginTop: 10,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#f0f0f0",
    width: "100%",
  },
  minhasComprasButton: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#2F4F4F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  minhasComprasText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  searchFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    height: "100%",
    fontSize: 15,
  },
  clearSearchIcon: {
    padding: 5,
  },
  filterButton: {
    padding: 10,
    marginLeft: 8,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 2,
    height: 44,
    justifyContent: "center",
  },
  listContent: {
    padding: 16,
    width: "100%",
  },
  columnWrapper: {
    justifyContent: "space-between", // Distribui os cards uniformemente
    width: "100%",
    gap: 12, // Espaço entre os cards
  },
  cardWrapper: {
    marginBottom: 12, // Espaço entre as linhas
    flexGrow: 0, // Impede que o card cresça além do tamanho definido
    flexShrink: 0, // Impede que o card encolha além do tamanho definido
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "grey",
  },
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    elevation: 5,
    maxHeight: "70%", // Limita altura do modal
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    marginTop: 10,
  },
  pickerContainerModal: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
  },
  pickerStyle: {
    height: 50,
    width: "100%",
  },
  applyFilterButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  applyFilterButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeFilterButton: {
    padding: 10,
    alignItems: "center",
  },
  closeFilterButtonText: {
    color: "#007bff",
    fontSize: 15,
  },
})