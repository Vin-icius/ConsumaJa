import React, { ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import { tableStyles } from './tableStyles';
import { useTableContext } from './TableContext';

interface RowProps {
  children: ReactNode;
  isHeader?: boolean;
  index?: number;
}

export const Row: React.FC<RowProps> = ({ children, isHeader = false, index = 0 }) => {
  const { rows, setRows } = useTableContext();

  useEffect(() => {
    if (!isHeader) {
      // Incrementa o contador de linhas quando uma Row do body é montada
      setRows(rows + 1);
    }
  }, []);

  const getRowStyle = () => {
    if (isHeader) {
      return tableStyles.headRow;
    }

    // Alterna cores para linhas pares e ímpares
    return index % 2 === 0 ? [tableStyles.bodyRow, tableStyles.bodyRowEven] : [tableStyles.bodyRow, tableStyles.bodyRowOdd];
  };

  return (
    <View style={getRowStyle()}>
      {children}
    </View>
  );
};
