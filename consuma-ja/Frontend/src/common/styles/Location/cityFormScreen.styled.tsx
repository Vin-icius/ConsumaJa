import { StyleSheet } from "react-native";

export const cityStyles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    label: { fontSize: 16, marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 10, paddingHorizontal: 15, marginBottom: 15, borderRadius: 5, fontSize: 16, backgroundColor: '#f9f9f9' },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, backgroundColor: '#f9f9f9' },
    picker: { height: 50 },
    pickerPlaceholder: { color: 'grey' },
    pickerDisabledBackground: { backgroundColor: '#e9ecef' },
    pickerDisabledText: { color: '#6c757d' },
    inputError: { borderColor: 'red' },
    errorText: { color: 'red', fontSize: 12, marginBottom: 10, marginTop: -10 },
    button: { padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
    saveButton: { backgroundColor: '#0066cc' },
    buttonDisabled: { backgroundColor: '#a7c7e7' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});