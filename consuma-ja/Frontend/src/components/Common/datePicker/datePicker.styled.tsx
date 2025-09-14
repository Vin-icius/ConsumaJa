import { StyleSheet } from 'react-native';

export const datePickerStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#495057',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 12,
    minHeight: 48,
  },
  inputText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  placeholderText: {
    color: '#6c757d',
  },
  webInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 12,
    minHeight: 48,
    fontSize: 16,
    color: '#212529',
  },
});
