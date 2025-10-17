import { StyleSheet } from 'react-native';

export const relatorioAvaliacoesStyles = StyleSheet.create({
  // --- Estilos Gerais ---
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d9534f',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: 'gray',
    fontSize: 16,
    padding: 20,
  },

  // --- Estilos dos Filtros ---
  filtersContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    fontSize: 16,
  },
  periodButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 5,
  },
  periodButtonActive: {
    backgroundColor: '#007bff',
  },
  periodButtonText: {
    textAlign: 'center',
    color: '#007bff',
    fontWeight: 'bold',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    fontSize: 16,
    marginHorizontal: 2,
  },

  // --- Estilos da Tabela ---
  tableContainer: {
    margin: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: 'white',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 2,
    borderBottomColor: '#dee2e6',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeaderCell: {
    padding: 12,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#495057',
  },
  tableCell: {
    padding: 12,
    fontSize: 14,
    color: '#212529',
  },
});