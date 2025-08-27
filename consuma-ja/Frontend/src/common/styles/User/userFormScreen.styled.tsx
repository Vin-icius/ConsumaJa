import { StyleSheet } from "react-native";

export const userFormStyles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 30, // Adicionar padding na parte inferior
  },
  container: {
    flex: 1,
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6c757d",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 8,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBadge: {
    backgroundColor: "#e9ecef",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  headerBadgeText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#343a40",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: "#495057",
    fontWeight: "500",
  },
  requiredMark: {
    color: "#dc3545",
    fontWeight: "bold",
  },
  readonlyField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9ecef",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  readonlyText: {
    fontSize: 16,
    color: "#6c757d",
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#495057",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorMessage: {
    color: "#dc3545",
    fontSize: 13,
    marginTop: 4,
    marginLeft: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    height: 48,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 40, // Aumentar a margem inferior para evitar sobreposição
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 6,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#007bff",
    marginLeft: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonDisabled: {
    backgroundColor: "#a7c7e7",
  },
})