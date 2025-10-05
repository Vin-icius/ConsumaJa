import { StyleSheet } from 'react-native';

export const relatoriosStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemIcon: {
    marginRight: 15,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  arrowIcon: {
    marginLeft: 'auto',
  },
});