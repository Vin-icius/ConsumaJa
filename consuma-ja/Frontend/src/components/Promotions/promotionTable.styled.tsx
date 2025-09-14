import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const promotionTableStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginHorizontal: screenWidth < 600 ? 5 : 10,
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: screenWidth < 600 ? 8 : 12,
    paddingHorizontal: screenWidth < 600 ? 4 : 8,
    borderBottomWidth: 1,
    borderBottomColor: '#0056b3',
  },
  headerCell: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: screenWidth < 600 ? 10 : 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: screenWidth < 600 ? 8 : 12,
    paddingHorizontal: screenWidth < 600 ? 4 : 8,
    alignItems: 'center',
  },
  inactiveRow: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  cell: {
    fontSize: screenWidth < 600 ? 10 : 12,
    color: '#333',
    textAlign: 'center',
  },
  cellContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  idCell: {
    width: screenWidth < 600 ? 30 : 40,
    flex: 0,
  },
  descriptionCell: {
    flex: screenWidth < 600 ? 1.5 : 2,
    textAlign: 'left',
    paddingRight: 8,
  },
  supplierCell: {
    flex: screenWidth < 600 ? 1 : 1.5,
    textAlign: 'left',
  },
  dateCell: {
    width: screenWidth < 600 ? 60 : 80,
    flex: 0,
  },
  statusCell: {
    width: screenWidth < 600 ? 50 : 70,
    flex: 0,
    alignItems: 'center',
  },
  actionsCell: {
    width: screenWidth < 600 ? 60 : 80,
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: screenWidth < 600 ? 4 : 8,
    paddingVertical: screenWidth < 600 ? 2 : 4,
    borderRadius: 12,
    minWidth: screenWidth < 600 ? 45 : 60,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#28a745',
  },
  inactiveBadge: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    color: 'white',
    fontSize: screenWidth < 600 ? 8 : 10,
    fontWeight: 'bold',
  },
  actionButton: {
    width: screenWidth < 600 ? 24 : 28,
    height: screenWidth < 600 ? 24 : 28,
    borderRadius: screenWidth < 600 ? 12 : 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  activateButton: {
    backgroundColor: '#28a745',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
