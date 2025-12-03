import React, { ReactNode } from 'react';
import { View, ScrollView } from 'react-native';
import { tableStyles } from './tableStyles';
import { Body, BodyProps } from './Body';

interface TableContentProps {
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export const TableContent: React.FC<TableContentProps> = ({ children, isEmpty = false, emptyMessage }) => {
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    const childType = child.type as any;
    const isBodyComponent =
      childType === Body || childType?.displayName === Body.displayName;

    if (isBodyComponent) {
      return React.cloneElement(child, {
        isEmpty,
        emptyMessage,
      } as Partial<BodyProps>);
    }

    return child;
  });

  const tableSurface = (
    <View style={tableStyles.table}>
      {enhancedChildren}
    </View>
  );

  return (
    <View style={tableStyles.container}>
      <ScrollView
        horizontal
        bounces={false}
        style={tableStyles.horizontalScroll}
        contentContainerStyle={tableStyles.horizontalScrollContent}
        showsHorizontalScrollIndicator
      >
        {tableSurface}
      </ScrollView>
    </View>
  );
};
