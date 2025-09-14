import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { tableStyles } from './tableStyles';

interface BodyProps {
  children: ReactNode;
}

export const Body: React.FC<BodyProps> = ({ children }) => {
  return (
    <View style={tableStyles.body}>
      {children}
    </View>
  );
};
