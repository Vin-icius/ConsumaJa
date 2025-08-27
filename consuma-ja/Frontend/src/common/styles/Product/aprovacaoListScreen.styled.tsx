import { StyleSheet } from "react-native";

export const aprovacaoListStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    list: { padding: 10, },
    listItem: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
    listItemText: { flex: 1, marginRight: 10 },
    itemTextTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
    itemText: { fontSize: 14, marginBottom: 2 },
    itemSubText: { fontSize: 12, color: 'grey' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 20 },
    errorText: { color: 'red', fontSize: 16 },
});