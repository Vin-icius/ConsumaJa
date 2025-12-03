import { StyleSheet } from 'react-native';

export const productTableStyles = StyleSheet.create({
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
  },
  mutedText: {
    fontSize: 12,
    color: '#868e96',
  },
  statusColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 4,
    minWidth: 110,
    alignItems: 'center',
  },
  statusApproved: {
    backgroundColor: '#0ca678',
  },
  statusPending: {
    backgroundColor: '#ffa94d',
  },
  statusRejected: {
    backgroundColor: '#f03e3e',
  },
  statusLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  activePill: {
    backgroundColor: '#228be6',
  },
  inactivePill: {
    backgroundColor: '#adb5bd',
  },
  actionsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#1c7ed6',
  },
  deleteButton: {
    backgroundColor: '#e03131',
  },
  disabledButton: {
    backgroundColor: '#adb5bd',
  },
  detailsText: {
    fontSize: 12,
    color: '#495057',
  },
});
