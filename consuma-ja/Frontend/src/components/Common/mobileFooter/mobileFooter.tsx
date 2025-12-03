import React, { useState } from 'react';
import { View, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { mobileFooterStyles } from './mobileFooter.styled';
import { useCart } from '../../../contexts/CartContext/cartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationBell from '../notificationBell/NotificationBell';
import MobileSearchPanel from './mobileSearchPanel';

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
  const [isSearchVisible, setIsSearchVisible] = useState(false);

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

  const renderBadge = (badgeContent?: string) => {
    if (!badgeContent) {
      return null;
    }

    return (
      <View style={mobileFooterStyles.badgeContainer}>
        <Text style={mobileFooterStyles.badgeText}>{badgeContent}</Text>
      </View>
    );
  };

  const renderButton = (
    icons: { active: React.ComponentProps<typeof Ionicons>['name']; inactive: React.ComponentProps<typeof Ionicons>['name'] },
    label: string,
    onPress: () => void,
    isActive: boolean,
    badgeContent?: string,
  ) => {
    const iconColor = isActive ? '#ffffff' : '#2F4F4F';
    const iconName = isActive ? icons.active : icons.inactive;

    return (
      <TouchableOpacity
        onPress={onPress}
        style={[mobileFooterStyles.button, isActive && mobileFooterStyles.activeButton]}
        activeOpacity={0.85}
      >
        {renderBadge(badgeContent)}
        <Ionicons name={iconName} size={22} color={iconColor} />
        <Text style={[mobileFooterStyles.iconLabel, isActive && mobileFooterStyles.activeLabel]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const cartBadge = totalItems > 0 ? (totalItems > 99 ? '99+' : totalItems.toString()) : undefined;

  return (
    <>
      <View style={[mobileFooterStyles.container, { paddingBottom: 8 + insets.bottom }]}>
        {renderButton({ active: 'home', inactive: 'home-outline' }, 'Início', navigateHome, activeTab === 'home')}
        {renderButton({ active: 'cart', inactive: 'cart-outline' }, 'Carrinho', navigateCart, activeTab === 'cart', cartBadge)}
        <NotificationBell
          renderTrigger={({ open, unreadCount, badgeLabel }) =>
            renderButton(
              { active: 'notifications', inactive: 'notifications-outline' },
              'Notificações',
              open,
              false,
              unreadCount > 0 ? badgeLabel : undefined,
            )
          }
        />
        {renderButton(
          { active: 'search', inactive: 'search-outline' },
          'Buscar promoções',
          () => setIsSearchVisible(true),
          isSearchVisible,
        )}
        {renderButton({ active: 'menu', inactive: 'menu' }, 'Menu', openMenu, false)}
      </View>
      <MobileSearchPanel visible={isSearchVisible} onClose={() => setIsSearchVisible(false)} />
    </>
  );
};

export default MobileFooterNav;
