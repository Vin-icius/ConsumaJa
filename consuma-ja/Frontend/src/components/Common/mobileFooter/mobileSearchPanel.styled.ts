import { StyleSheet } from 'react-native';

export const mobileSearchPanelStyles = StyleSheet.create({
  keyboardAvoider: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F5',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E6ED',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1F2933',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F4F6F8',
  },
  chipActive: {
    backgroundColor: '#D1FAE5',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2933',
  },
  chipTextActive: {
    color: '#065F46',
  },
  categoriesScroll: {
    paddingVertical: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  clearButton: {
    flex: 1,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#3F4E65',
    fontWeight: '600',
    fontSize: 14,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#2F4F4F',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  emptyMessage: {
    color: '#6B7280',
    fontSize: 13,
  },
});
