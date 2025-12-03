import { StyleSheet } from 'react-native';

export const tableStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 10,
  },
  table: {
    flexGrow: 1,
    minWidth: 900,
    alignSelf: 'flex-start',
  },
  horizontalScroll: {
    width: '100%',
  },
  horizontalScrollContent: {
    flexGrow: 1,
    minWidth: '100%',
  },
  head: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 2,
    borderBottomColor: '#dee2e6',
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headCell: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'left',
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  bodyRowEven: {
    backgroundColor: '#f8f9fa',
  },
  bodyRowOdd: {
    backgroundColor: '#fff',
  },
  bodyCell: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'left',
    flex: 1,
  },
  footer: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: 2,
    borderTopColor: '#dee2e6',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
  },
  emptyState: {
    minHeight: 240,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#adb5bd',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  // Cell variants
  cellLimitWidth: {
    maxWidth: 100,
  },
  cellLimitHeight: {
    maxHeight: 40,
  },
  cellCenter: {
    textAlign: 'center',
  },
  cellRight: {
    textAlign: 'right',
  },
  cellBold: {
    fontWeight: '600',
  },
  cellItalic: {
    fontStyle: 'italic',
  },
  cellSmall: {
    fontSize: 12,
  },
  cellLarge: {
    fontSize: 16,
  },
});
