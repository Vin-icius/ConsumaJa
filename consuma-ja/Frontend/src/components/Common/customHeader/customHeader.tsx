import React from 'react';
import { View, TouchableOpacity, useWindowDimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useSearch } from '../../../contexts/SearchHomeContext/searchHomeContext';
import SearchBar from '../searchBar/SearchBar';
import { customHeaderStyles } from './customHeader.styled';
import FilterDropdown from '../filters/FilterDropdown';
import { useCart } from '../../../contexts/CartContext/cartContext';
import NotificationBell from '../notificationBell/NotificationBell';

interface CustomHeaderProps {
  showFilter?: boolean;
  showAddButton?: boolean;
  onAddPress?: () => void;
  hideSearchBar?: boolean;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ showFilter = false, showAddButton = false, onAddPress, hideSearchBar = false }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const { searchQuery, setSearchQuery, performSearch, searchType, categoriasFiltro, selectedFilters, setSelectedFilters } = useSearch();
  const { getTotalItems } = useCart();

  const totalItems = getTotalItems();

  const getPlaceholder = () => {
    if (searchType === 'produto') return 'Buscar produtos...';
    if (searchType === 'fornecedor') return 'Buscar fornecedores...';
    if (searchType === 'promocao') return 'Buscar promoções...';
    return 'Buscar...';
  };

  const filterOptions = [
    { label: 'Fornecedor', value: 'fornecedor' },
    {
      label: 'Categorias',
      value: 'categories',
      subOptions: [
        { label: 'Todas as Categorias', value: undefined },
        ...categoriasFiltro.map(cat => ({ label: cat.categoria_nome, value: cat.categoria_id })),
      ],
    },
    ...(selectedFilters.length > 0 ? [{ label: 'Limpar filtros', value: 'clear' }] : []),
  ];

  const handleFilterChange = (value: any) => {
    if (value === 'clear') {
      setSelectedFilters([]);
      setSearchQuery('');
    } else if (value === 'fornecedor') {
      setSelectedFilters(prev =>
        prev.includes('fornecedor') ? prev.filter(v => v !== 'fornecedor') : [...prev, 'fornecedor']
      );
    } else if (typeof value === 'number') {
      setSelectedFilters(prev => {
        const withoutCategories = prev.filter(v => typeof v !== 'number');
        const hasThisCategory = prev.includes(value);
        if (hasThisCategory) {
          return withoutCategories; // desmarcar
        } else {
          return [...withoutCategories, value]; // marcar essa, removendo outras
        }
      });
    }
  };

  const handleCartPress = () => {
    navigation.navigate('ShoppingCart' as never);
  };

  return (
    <View style={[customHeaderStyles.container, isLargeScreen && customHeaderStyles.largeContainer]}>
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <Ionicons name="menu" size={24} color="white" />
      </TouchableOpacity>
      {!hideSearchBar && (
        <View style={[customHeaderStyles.searchContainer, isLargeScreen && customHeaderStyles.largeSearchContainer]}>
          <SearchBar
            placeholder={getPlaceholder()}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={performSearch}
          />
          {showFilter && (
            <View style={[customHeaderStyles.filterSpacing, isLargeScreen && { marginLeft: 20 }]}>
              <FilterDropdown
                options={filterOptions}
                value={selectedFilters}
                onValueChange={handleFilterChange}
                placeholder="Filtrar"
              />
            </View>
          )}
          {showAddButton && onAddPress && (
            <TouchableOpacity
              style={[customHeaderStyles.addButton, isLargeScreen && customHeaderStyles.largeAddButton]}
              onPress={onAddPress}
            >
              <Ionicons name="add-circle-outline" size={isLargeScreen ? 28 : 24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}
      <TouchableOpacity style={[customHeaderStyles.notificationSpacing, isLargeScreen && { marginLeft: 20 }]} onPress={handleCartPress}>
        <View style={customHeaderStyles.cartIconContainer}>
          <Ionicons name="cart-outline" size={24} color="white" />
          {totalItems > 0 && (
            <View style={customHeaderStyles.cartBadge}>
              <Text style={customHeaderStyles.cartBadgeText}>
                {totalItems > 99 ? '99+' : totalItems.toString()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <NotificationBell containerStyle={[customHeaderStyles.notificationSpacing, isLargeScreen && { marginLeft: 20 }]} />
    </View>
  );
};

export default CustomHeader;
