import { StyleSheet } from "react-native";

export const aprovacaoDetailStyles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    detailItem: { flexDirection: 'row', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    detailLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', width: 120 }, // Largura fixa para alinhar
    detailValue: { fontSize: 16, color: '#555', flex: 1 }, // Ocupa resto do espaço
    actionsContainer: { marginTop: 30, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
    label: { fontSize: 16, marginBottom: 5, color: '#333', fontWeight: '500', marginTop: 15 },
    input: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 8, paddingHorizontal: 12, marginBottom: 15, borderRadius: 5, fontSize: 15, backgroundColor: '#f9f9f9' },
    textArea: { height: 80, textAlignVertical: 'top' },
    button: { padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 15 },
    approveButton: { backgroundColor: '#28a745' }, // Verde
    rejectButton: { backgroundColor: '#dc3545' }, // Vermelho
    buttonDisabled: { backgroundColor: '#a7c7e7' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
});