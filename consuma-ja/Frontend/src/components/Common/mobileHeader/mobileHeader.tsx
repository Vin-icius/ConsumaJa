import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mobileHeaderStyles } from './mobileHeader.styled';

interface MobileBackHeaderProps {
  onBack: () => void;
  backgroundColor?: string;
  iconColor?: string;
  accessory?: React.ReactNode;
}

const MobileBackHeader: React.FC<MobileBackHeaderProps> = ({
  onBack,
  backgroundColor = '#2F4F4F',
  iconColor = '#ffffff',
  accessory,
}) => {
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, 16);

  return (
    <View style={[mobileHeaderStyles.container, { paddingTop: safeTop, backgroundColor }]}>
      <View style={mobileHeaderStyles.inner}>
        <TouchableOpacity
          onPress={onBack}
          style={mobileHeaderStyles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        {accessory}
      </View>
    </View>
  );
};

export default MobileBackHeader;
