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
  imagePickerContainer: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    padding: 16,
    alignItems: "center",
  },
  imagePreview: {
    width: 160,
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#f1f3f5",
  },
  imagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f3f5",
    borderWidth: 1,
    borderColor: "#dee2e6",
    paddingHorizontal: 12,
  },
  imagePlaceholderText: {
    color: "#868e96",
    fontSize: 12,
    textAlign: "center",
  },
  imagePickerButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160,
  },
  imagePickerButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  imagePickerButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  imageUploadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6c757d",
    textAlign: "center",
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