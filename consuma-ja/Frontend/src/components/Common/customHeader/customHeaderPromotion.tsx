import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useSearch } from '../../../contexts/SearchHomeContext/searchHomeContext';
import SearchBar from '../searchBar/SearchBar';
import { customHeaderStyles } from './customHeader.styled';
import FilterDropdown from '../filters/FilterDropdown';
import NotificationBell from '../notificationBell/NotificationBell';

interface CustomHeaderPromotionProps {
  showFilter?: boolean;
  showAddButton?: boolean;
  onAddPress?: () => void;
}

const CustomHeaderPromotion: React.FC<CustomHeaderPromotionProps> = ({
  showFilter = false,
  showAddButton = false,
  onAddPress
}) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    selectedCategoriaId,
    setSelectedCategoriaId,
    categoriasFiltro,
    selectedFilters,
    setSelectedFilters,
  } = useSearch();

  useEffect(() => {
    const hasFornecedor = selectedFilters.includes('fornecedor');
    const categorias = selectedFilters.filter((v: any) => typeof v === 'number');
    setSearchType(hasFornecedor ? 'fornecedor' : 'promocao');
    setSelectedCategoriaId(categorias[0] || undefined);
  }, [selectedFilters, setSearchType, setSelectedCategoriaId]);

  const getPlaceholder = () => {
    if (searchType === 'produto') return 'Buscar produtos...';
    if (searchType === 'fornecedor') return 'Buscar fornecedores...';
    if (searchType === 'promocao') return 'Buscar promoções...';
    return 'Buscar...';
  };

  const filterOptions = [
    { label: 'Fornecedor', value: 'fornecedor' },
    ...(categoriasFiltro.length > 0 ? [{
      label: 'Categorias',
      value: 'categories',
      subOptions: [
        { label: 'Todas as Categorias', value: undefined },
        ...categoriasFiltro.map((cat: any) => ({ label: cat.categoria_nome, value: cat.categoria_id })),
      ],
    }] : []),
    ...(selectedFilters.length > 0 ? [{ label: 'Limpar filtros', value: 'clear' }] : []),
  ];

  const handleFilterChange = (value: any) => {
    if (value === 'clear') {
      setSelectedFilters([]);
      setSearchQuery('');
    } else if (value === 'fornecedor') {
      setSelectedFilters((prev: any[]) =>
        prev.includes('fornecedor') ? prev.filter((v: any) => v !== 'fornecedor') : [...prev, 'fornecedor']
      );
    } else if (typeof value === 'number') {
      setSelectedFilters((prev: any[]) => {
        const withoutCategories = prev.filter((v: any) => typeof v !== 'number');
        const hasThisCategory = prev.includes(value);
        if (hasThisCategory) {
          return withoutCategories; // desmarcar
        } else {
          return [...withoutCategories, value]; // marcar essa, removendo outras
        }
      });
    }
  };

  return (
    <View style={[customHeaderStyles.container, isLargeScreen && customHeaderStyles.largeContainer]}>
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <Ionicons name="menu" size={24} color="white" />
      </TouchableOpacity>
      <View style={[customHeaderStyles.searchContainer, isLargeScreen && customHeaderStyles.largeSearchContainer]}>
        <SearchBar
          placeholder={getPlaceholder()}
          value={searchQuery}
          onChangeText={setSearchQuery}
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
      <NotificationBell containerStyle={[customHeaderStyles.notificationSpacing, isLargeScreen && { marginLeft: 20 }]} />
    </View>
  );
};

export default CustomHeaderPromotion;