import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { tableStyles } from './tableStyles';
import { useTableContext } from './TableContext';

interface FooterProps {
  children?: ReactNode;
  showInfo?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ children, showInfo = true }) => {
  const { columns, rows } = useTableContext();

  return (
    <View style={tableStyles.footer}>
      {children ? (
        children
      ) : showInfo ? (
        <View style={tableStyles.footerContent}>
          <Text style={tableStyles.footerText}>
            {rows} linha{rows !== 1 ? 's' : ''}, {columns} coluna{columns !== 1 ? 's' : ''}
          </Text>
        </View>
      ) : null}
    </View>
  );
};
