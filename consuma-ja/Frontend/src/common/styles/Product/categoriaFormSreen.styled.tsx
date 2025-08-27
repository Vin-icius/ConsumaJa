import { StyleSheet } from "react-native";

export const categoriaFormStyles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    label: { fontSize: 16, marginBottom: 5, color: '#333', fontWeight: '500' },
    input: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 10, paddingHorizontal: 15, marginBottom: 5, borderRadius: 5, fontSize: 16, backgroundColor: '#f9f9f9' }, // Diminui margin Bottom
    inputError: { borderColor: 'red' },
    errorText: { color: 'red', fontSize: 12, marginBottom: 15, marginTop: -5 }, // Aumenta margin Bottom
    button: { padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 }, // Aumenta margin Top
    saveButton: { backgroundColor: '#0066cc' },
    buttonDisabled: { backgroundColor: '#a7c7e7' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});