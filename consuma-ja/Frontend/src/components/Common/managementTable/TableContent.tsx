import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { tableStyles } from './tableStyles';

interface TableContentProps {
  children: ReactNode;
}

export const TableContent: React.FC<TableContentProps> = ({ children }) => {
  return (
    <View style={tableStyles.container}>
      <View style={tableStyles.table}>
        {children}
      </View>
    </View>
  );
};
