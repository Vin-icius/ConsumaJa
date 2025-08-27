import { StyleSheet } from "react-native";

export const promotionListStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' }, // Cor de fundo suave
    list: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 20 },
    listItem: { backgroundColor: 'white', padding: 15, marginBottom: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
    listItemInactive: { opacity: 0.6, backgroundColor: '#e9ecef' },
    listItemText: { flex: 1, marginRight: 10 },
    listItemButtons: { flexDirection: 'row', alignItems: 'center' },
    itemTextTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
    itemSubText: { fontSize: 13, color: '#555', marginBottom: 2 },
    statusActive: { fontSize: 12, color: 'green', fontWeight: 'bold', marginTop: 4 },
    statusInactive: { fontSize: 12, color: 'red', fontWeight: 'bold', marginTop: 4 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: '#d9534f', fontSize: 16, textAlign: 'center', marginBottom: 10 },
    retryButton: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginTop: 15},
    retryButtonText: { color: 'white', fontSize: 15, fontWeight: '500'},
    emptyText: { fontSize: 16, color: '#6c757d', textAlign: 'center' },
    emptySubText: { fontSize: 13, color: '#868e96', textAlign: 'center', marginTop: 5 },
    button: { padding: 10, borderRadius: 25, marginLeft: 8, justifyContent: 'center', alignItems: 'center', width: 44, height: 44 }, // Botões redondos
    editButton: { backgroundColor: '#ffc107' },
    deleteButton: { backgroundColor: '#dc3545' },
    activateButton: { backgroundColor: '#28a745'},
    addButton: { width: 'auto', height: 'auto', backgroundColor: '#007bff', marginVertical: 10, marginHorizontal:15, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'stretch', alignItems: 'center', borderRadius: 8, flexDirection: 'row', justifyContent: 'center', elevation: 2 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});