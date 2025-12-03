import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { tableStyles } from './tableStyles';

export interface BodyProps {
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export const Body: React.FC<BodyProps> = ({ children, isEmpty = false, emptyMessage }) => {
  if (isEmpty) {
    return (
      <View style={[tableStyles.body, tableStyles.emptyState]}>
        {emptyMessage ? (
          <Text style={tableStyles.emptyMessage}>{emptyMessage}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={tableStyles.body}>
      {children}
    </View>
  );
};

Body.displayName = 'ManagementTableBody';
