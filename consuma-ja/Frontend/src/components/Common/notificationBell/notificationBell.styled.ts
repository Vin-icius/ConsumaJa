import { StyleSheet } from 'react-native'

export const notificationBellStyles = StyleSheet.create({
  container: {
    position: 'relative',
    marginLeft: 10,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff7043',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#28a745',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: 320,
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  refreshButton: {
    padding: 6,
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ececec',
  },
  itemUnread: {
    backgroundColor: '#f4fbf6',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  itemMessage: {
    fontSize: 13,
    color: '#515151',
    marginTop: 2,
  },
  itemTimestamp: {
    fontSize: 11,
    color: '#7d7d7d',
    marginTop: 4,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#6b6b6b',
  },
})
