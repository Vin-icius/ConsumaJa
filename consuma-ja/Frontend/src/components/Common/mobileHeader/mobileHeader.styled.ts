import { StyleSheet } from 'react-native';

export const mobileHeaderStyles = StyleSheet.create({
  container: {
    backgroundColor: '#2F4F4F',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 48,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});