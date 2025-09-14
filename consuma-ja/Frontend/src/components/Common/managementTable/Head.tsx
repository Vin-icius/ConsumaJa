import React, { ReactNode, useEffect } from 'react';
import { View, Text, StyleProp, TextStyle } from 'react-native';
import { tableStyles } from './tableStyles';
import { useTableContext } from './TableContext';

interface HeadProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  size?: 'small' | 'normal' | 'large';
  limitWidth?: number;
  limitHeight?: number;
}

export const Head: React.FC<HeadProps> = ({
  children,
  align = 'left',
  bold = true,
  italic = false,
  size = 'normal',
  limitWidth,
  limitHeight
}) => {
  const { columns, setColumns } = useTableContext();

  useEffect(() => {
    // Incrementa o contador de colunas quando um Head é montado
    setColumns(columns + 1);
  }, []);

  const getCellStyle = (): StyleProp<TextStyle> => {
    let style: any[] = [tableStyles.headCell];

    if (align === 'center') style.push(tableStyles.cellCenter);
    if (align === 'right') style.push(tableStyles.cellRight);
    if (bold) style.push(tableStyles.cellBold);
    if (italic) style.push(tableStyles.cellItalic);
    if (size === 'small') style.push(tableStyles.cellSmall);
    if (size === 'large') style.push(tableStyles.cellLarge);
    if (limitWidth) style.push({ maxWidth: limitWidth });
    if (limitHeight) style.push({ maxHeight: limitHeight });

    return style;
  };

  return (
    <Text style={getCellStyle()}>
      {children}
    </Text>
  );
};
