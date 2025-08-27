import { Dimensions, Platform, StyleSheet } from "react-native"

const { width } = Dimensions.get("window")

export const registerStyles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backToLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backToLoginText: {
    color: "#0066cc",
    marginLeft: 5,
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  sectionButtons: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 5,
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  activeSectionButton: {
    backgroundColor: "#0066cc",
  },
  sectionIcon: {
    marginRight: 5,
  },
  sectionButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  activeSectionButtonText: {
    color: "#fff",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#555",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderColor: "red",
  },
  inputDisabled: {
    backgroundColor: "#e9ecef",
  },
  disabledText: {
    color: "#6c757d",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 3,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    marginTop: Platform.OS === "ios" ? -10 : 0,
  },
  pickerPlaceholder: {
    color: "#a1a1a1",
  },
  passwordToggle: {
    padding: 10,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  backButtonText: {
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: "#0066cc",
  },
  finalizarButton: {
    backgroundColor: "#28a745",
  },
  buttonDisabled: {
    backgroundColor: "#a7c7e7",
  },
  navigationButtonText: {
    color: "white",
    marginRight: 5,
    fontWeight: "500",
  },
  photoSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    marginVertical: 15,
    flexWrap: "wrap",
  },
  photoPreviewContainer: {
    alignItems: "center",
    width: width > 500 ? "45%" : "100%",
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  imagePickerButton: {
    flexDirection: "row",
    backgroundColor: "#5bc0de",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  imagePickerButtonText: {
    color: "white",
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
  },
})