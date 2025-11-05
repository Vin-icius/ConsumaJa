import React from 'react';
import { View, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { mobileFooterStyles } from './mobileFooter.styled';
import { useCart } from '../../../contexts/CartContext/cartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MobileFooterNavProps = {
  activeTab?: 'home' | 'cart';
};

const MobileFooterNav: React.FC<MobileFooterNavProps> = ({ activeTab = 'home' }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const navigation = useNavigation<any>();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const insets = useSafeAreaInsets();

  if (isDesktop) {
    return null;
  }

  const navigateHome = () => {
    navigation.navigate('Inicio');
  };

  const navigateCart = () => {
    navigation.navigate('ShoppingCart');
  };

  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const renderCartBadge = () => {
    if (totalItems <= 0) return null;

    return (
      <View style={mobileFooterStyles.cartBadgeContainer}>
        <Text style={mobileFooterStyles.cartBadgeText}>{totalItems > 99 ? '99+' : totalItems.toString()}</Text>
      </View>
    );
  };

  const renderButton = (
    icons: { active: React.ComponentProps<typeof Ionicons>['name']; inactive: React.ComponentProps<typeof Ionicons>['name'] },
    label: string,
    onPress: () => void,
    isActive: boolean,
    showBadge?: boolean,
  ) => {
    const iconColor = isActive ? '#ffffff' : '#2F4F4F';
    const iconName = isActive ? icons.active : icons.inactive;

    return (
      <TouchableOpacity
        onPress={onPress}
        style={[mobileFooterStyles.button, isActive && mobileFooterStyles.activeButton]}
        activeOpacity={0.85}
      >
        {showBadge && renderCartBadge()}
        <Ionicons name={iconName} size={22} color={iconColor} />
        <Text style={[mobileFooterStyles.iconLabel, isActive && mobileFooterStyles.activeLabel]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
  <View style={[mobileFooterStyles.container, { paddingBottom: 8 + insets.bottom }]}>
      {renderButton({ active: 'home', inactive: 'home-outline' }, 'Início', navigateHome, activeTab === 'home')}
      {renderButton({ active: 'cart', inactive: 'cart-outline' }, 'Carrinho', navigateCart, activeTab === 'cart', true)}
      {renderButton({ active: 'menu', inactive: 'menu' }, 'Menu', openMenu, false)}
    </View>
  );
};

export default MobileFooterNav;
