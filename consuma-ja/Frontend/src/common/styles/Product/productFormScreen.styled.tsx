import { StyleSheet } from "react-native";

export const productFormStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#212529",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#495057",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  picker: {
    height: 50,
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
})