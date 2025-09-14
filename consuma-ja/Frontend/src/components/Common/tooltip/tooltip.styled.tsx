import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const tooltipStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    margin: 20,
    maxWidth: width * 0.8,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
});
