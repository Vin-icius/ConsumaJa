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
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
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
  successText: {
    color: "#2e7d32",
    fontSize: 13,
    marginTop: 6,
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
  secondaryButton: {
    backgroundColor: "#757575",
    marginTop: 10,
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
  paymentSection: {
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  paymentSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  paymentCancelEditButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d32f2f",
    backgroundColor: "#fff5f5",
    marginLeft: 12,
  },
  paymentCancelEditText: {
    marginLeft: 6,
    color: "#d32f2f",
    fontWeight: "600",
    fontSize: 12,
  },
  paymentEditingContext: {
    fontSize: 13,
    color: "#555",
    marginBottom: 10,
  },
  paymentInfoText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  paymentTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  paymentTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4CAF50",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  paymentTypeButtonActive: {
    backgroundColor: "#4CAF50",
  },
  paymentTypeButtonText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 13,
  },
  paymentTypeButtonTextActive: {
    color: "#fff",
  },
  paymentFormActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  paymentList: {
    marginTop: 20,
  },
  paymentCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  paymentCardInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  paymentCardText: {
    flex: 1,
  },
  paymentCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  paymentCardDetail: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  paymentBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  paymentBadgeEditing: {
    backgroundColor: "#fff3cd",
    color: "#8a6d3b",
  },
  paymentCardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  paymentActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    marginLeft: 10,
    marginTop: 6,
    backgroundColor: "#fff",
  },
  paymentActionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CAF50",
  },
  paymentActionButtonPrimary: {
    borderColor: "#2e7d32",
    backgroundColor: "#e8f5e9",
  },
  paymentActionButtonPrimaryText: {
    color: "#2e7d32",
  },
  paymentActionButtonDanger: {
    borderColor: "#d32f2f",
    backgroundColor: "#fff5f5",
  },
  paymentActionButtonDangerText: {
    color: "#d32f2f",
  },
  paymentActionButtonDisabled: {
    opacity: 0.5,
  },
  paymentCardEditing: {
    borderColor: "#81C784",
    backgroundColor: "#f3fbf5",
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
  inlineFeedback: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  feedbackText: {
    marginLeft: 8,
    color: "#4CAF50",
    fontSize: 14,
  },
  twoFactorStatusCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#f1f8f4",
    flexDirection: "row",
    alignItems: "center",
  },
  twoFactorStatusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  twoFactorStatusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e7d32",
  },
  twoFactorStatusDescription: {
    fontSize: 13,
    color: "#4f624f",
    marginTop: 4,
  },
  twoFactorSecondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  twoFactorSecondaryButtonText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
  },
  twoFactorContainer: {
    marginTop: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  twoFactorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  twoFactorInstructions: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    lineHeight: 20,
  },
  qrCodeImage: {
    alignSelf: "center",
    width: 180,
    height: 180,
    marginVertical: 12,
  },
  twoFactorLoader: {
    marginVertical: 20,
  },
  secretContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#eef7ee",
  },
  secretLabel: {
    fontSize: 13,
    color: "#2e7d32",
    marginBottom: 4,
    fontWeight: "600",
  },
  secretValue: {
    fontSize: 16,
    letterSpacing: 1,
    color: "#1b5e20",
    fontWeight: "700",
  },
  twoFactorCodeInput: {
    textAlign: "center",
    fontSize: 20,
    letterSpacing: 8,
    fontWeight: "600",
    backgroundColor: "#fff",
  },
  twoFactorButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  twoFactorCancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d32f2f",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  twoFactorCancelText: {
    color: "#d32f2f",
    fontWeight: "600",
    fontSize: 14,
  },
  twoFactorCancelNeutral: {
    borderColor: "#4CAF50",
  },
  twoFactorCancelNeutralText: {
    color: "#4CAF50",
  },
  twoFactorConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  twoFactorButtonDisabled: {
    opacity: 0.6,
  },
  twoFactorConfirmButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },
})