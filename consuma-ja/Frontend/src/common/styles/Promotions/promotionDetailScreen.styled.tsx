import { StyleSheet } from "react-native";

export const promotionDetailStyles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', paddingVertical: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  retryText: { color: '#007bff', fontSize: 16, marginTop: 10},
  header: { paddingHorizontal: 15, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15 },
  promotionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5, textAlign: 'center' },
  supplierName: { fontSize: 16, color: 'grey', textAlign: 'center', marginBottom: 5 },
  dateInfo: { fontSize: 14, color: 'grey', textAlign: 'center', marginBottom: 10 },
  productItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  productImage: { width: 80, height: 80, borderRadius: 6, marginRight: 15, backgroundColor: '#f0f0f0' },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 4 },
  productMeasure: { fontSize: 13, color: 'grey', marginBottom: 3 },
  originalPrice: { fontSize: 12, textDecorationLine: 'line-through', color: '#aaa', marginBottom: 1 },
  promoPrice: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginBottom: 4 },
  productStock: { fontSize: 12, color: '#555', marginBottom: 2 },
  productValidity: { fontSize: 12, color: '#555' },
  addToCartButton: { flexDirection: 'row', backgroundColor: '#007bff', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 5, alignItems: 'center', justifyContent: 'center', minWidth: 100, alignSelf: 'flex-end' },
  addToCartButtonText: { color: 'white', fontSize: 13, fontWeight: 'bold', marginLeft: 5 },
  disabledButton: { backgroundColor: '#ced4da' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'grey' },
});