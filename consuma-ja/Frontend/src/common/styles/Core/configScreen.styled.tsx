import { Platform, StyleSheet } from "react-native";

export const configStyles = StyleSheet.create({
  // Container e layout
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  rowGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flexGrow: { flexGrow: 1 },
  marginRight: { marginRight: 10 },

  // Header
  header: {
    backgroundColor: "#4CAF50",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  // Tabs
  tabContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  activeTabButton: {
    backgroundColor: "#4CAF50",
  },
  tabText: {
    marginLeft: 5,
    color: "#4CAF50",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },

  // Seções
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },

  // Formulários
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "red",
  },
  inputDisabled: {
    backgroundColor: "#e9ecef",
    color: "#6c757d",
  },
  inputIcon: {
    marginLeft: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 3,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  // Picker
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 50,
    marginTop: Platform.OS === "ios" ? -10 : 0,
  },
  pickerPlaceholder: {
    color: "grey",
  },

  // Botões
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 25,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  retryButton: {
    backgroundColor: "#757575",
    marginTop: 15,
    paddingHorizontal: 30,
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Switches
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  switchDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  switchButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    padding: 2,
  },
  switchButtonActive: {
    backgroundColor: "#4CAF50",
  },
  switchKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
  },
  switchKnobActive: {
    alignSelf: "flex-end",
  },

  // Cartões de pagamento
  paymentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentCardInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  paymentCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  paymentCardNumber: {
    fontSize: 14,
    color: "#666",
  },
  paymentCardAction: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 5,
  },
  paymentCardActionText: {
    color: "#4CAF50",
    fontSize: 14,
  },
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 8,
    borderStyle: "dashed",
    marginTop: 10,
  },
  addPaymentText: {
    color: "#4CAF50",
    marginLeft: 5,
    fontSize: 16,
  },
})