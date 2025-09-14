import { StyleSheet } from "react-native";

export const customHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    padding: 10,
    alignItems: 'center',
    paddingTop: 40,
    zIndex: 1000,
    elevation: 1000,
  },
  largeContainer: {
    justifyContent: 'space-between',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  largeSearchContainer: {
    flex: 0.6,
    justifyContent: 'center',
    maxWidth: 500,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  largeSearchInput: {
    maxWidth: 400,
  },
  filterSpacing: {
    marginLeft: 10,
  },
  addButton: {
    marginLeft: 10,
    padding: 5,
  },
  largeAddButton: {
    marginLeft: 20,
  },
  notificationSpacing: {
    marginLeft: 10,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#28a745',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
