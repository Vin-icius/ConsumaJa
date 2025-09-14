import React, { ReactNode } from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';
import { tableStyles } from './tableStyles';

interface CellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  size?: 'small' | 'normal' | 'large';
  limitWidth?: number;
  limitHeight?: number;
  isHeader?: boolean;
}

export const Cell: React.FC<CellProps> = ({
  children,
  align = 'left',
  bold = false,
  italic = false,
  size = 'normal',
  limitWidth,
  limitHeight,
  isHeader = false
}) => {
  const getCellStyle = (): StyleProp<TextStyle> => {
    let style: any[] = [isHeader ? tableStyles.headCell : tableStyles.bodyCell];

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
