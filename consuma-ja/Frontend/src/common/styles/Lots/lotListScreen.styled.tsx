import { StyleSheet } from "react-native";

export const lotListStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#212529",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 4,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
  },
  filterButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ced4da",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#e9ecef",
    borderColor: "#adb5bd",
  },
  filterButtonText: {
    color: "#495057",
    fontSize: 14,
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    color: "#dc3545",
    marginLeft: 4,
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  loteCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loteInativo: {
    opacity: 0.7,
    borderStyle: "dashed",
  },
  loteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  loteCodigo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  loteActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  loteInfo: {
    position: "relative",
  },
  loteProduto: {
    fontSize: 16,
    marginBottom: 8,
    color: "#495057",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoItem: {
    fontSize: 14,
    color: "#6c757d",
  },
  infoLabel: {
    fontWeight: "500",
    color: "#495057",
  },
  statusBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#e9ecef",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#495057",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
  loader: {
    marginVertical: 20,
  },
})