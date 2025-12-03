import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileSearchPanelStyles } from './mobileSearchPanel.styled';
import { useSearch } from '../../../contexts/SearchHomeContext/searchHomeContext';

interface MobileSearchPanelProps {
  visible: boolean;
  onClose: () => void;
}

const MobileSearchPanel: React.FC<MobileSearchPanelProps> = ({ visible, onClose }) => {
  const {
    searchQuery,
    setSearchQuery,
    performSearch,
    searchType,
    selectedFilters,
    setSelectedFilters,
    categoriasFiltro,
  } = useSearch();

  const selectedCategoria = useMemo(
    () => selectedFilters.find(value => typeof value === 'number'),
    [selectedFilters]
  );
  const hasFornecedorFilter = selectedFilters.includes('fornecedor');

  const handleToggleFornecedor = () => {
    setSelectedFilters(prev =>
      prev.includes('fornecedor') ? prev.filter(value => value !== 'fornecedor') : [...prev, 'fornecedor']
    );
  };

  const handleCategoriaSelect = (categoriaId?: number) => {
    setSelectedFilters(prev => {
      const withoutCategories = prev.filter(value => typeof value !== 'number');

      if (categoriaId === undefined) {
        return withoutCategories;
      }

      if (prev.includes(categoriaId)) {
        return withoutCategories;
      }

      return [...withoutCategories, categoriaId];
    });
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
    setSearchQuery('');
  };

  const getPlaceholder = () => {
    if (searchType === 'produto') return 'Buscar produtos';
    if (searchType === 'fornecedor') return 'Buscar fornecedores';
    return 'Buscar promoções';
  };

  const handleSearch = () => {
    performSearch();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={mobileSearchPanelStyles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={mobileSearchPanelStyles.overlay}>
          <TouchableOpacity style={mobileSearchPanelStyles.backdrop} activeOpacity={1} onPress={onClose} />
          <View style={mobileSearchPanelStyles.panel}>
            <View style={mobileSearchPanelStyles.header}>
              <Text style={mobileSearchPanelStyles.headerTitle}>Buscar promoções</Text>
              <TouchableOpacity style={mobileSearchPanelStyles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={mobileSearchPanelStyles.searchInputWrapper}>
              <Ionicons name="search" size={18} color="#6B7280" />
              <TextInput
                style={mobileSearchPanelStyles.searchInput}
                placeholder={getPlaceholder()}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
                autoFocus
              />
            </View>

            <View style={mobileSearchPanelStyles.section}>
              <Text style={mobileSearchPanelStyles.sectionTitle}>Filtros rápidos</Text>
              <View style={mobileSearchPanelStyles.filterRow}>
                <TouchableOpacity
                  style={[
                    mobileSearchPanelStyles.chip,
                    { marginRight: 10, marginBottom: 8 },
                    hasFornecedorFilter && mobileSearchPanelStyles.chipActive,
                  ]}
                  onPress={handleToggleFornecedor}
                >
                  <Ionicons
                    name={hasFornecedorFilter ? 'people' : 'people-outline'}
                    size={16}
                    color={hasFornecedorFilter ? '#065F46' : '#1F2933'}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      mobileSearchPanelStyles.chipText,
                      hasFornecedorFilter && mobileSearchPanelStyles.chipTextActive,
                    ]}
                  >
                    Fornecedor
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    mobileSearchPanelStyles.chip,
                    { marginRight: 10, marginBottom: 8 },
                    selectedCategoria === undefined && mobileSearchPanelStyles.chipActive,
                  ]}
                  onPress={() => handleCategoriaSelect(undefined)}
                >
                  <Text
                    style={[
                      mobileSearchPanelStyles.chipText,
                      selectedCategoria === undefined && mobileSearchPanelStyles.chipTextActive,
                    ]}
                  >
                    Todas as categorias
                  </Text>
                </TouchableOpacity>
              </View>

              {categoriasFiltro.length === 0 ? (
                <Text style={mobileSearchPanelStyles.emptyMessage}>Nenhuma categoria disponível no momento.</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={mobileSearchPanelStyles.categoriesScroll}
                >
                  {categoriasFiltro.map(categoria => {
                    const isActive = categoria.categoria_id === selectedCategoria;
                    return (
                      <TouchableOpacity
                        key={categoria.categoria_id}
                        style={[
                          mobileSearchPanelStyles.chip,
                          { marginRight: 10, marginBottom: 8 },
                          isActive && mobileSearchPanelStyles.chipActive,
                        ]}
                        onPress={() => handleCategoriaSelect(categoria.categoria_id)}
                      >
                        <Text
                          style={[
                            mobileSearchPanelStyles.chipText,
                            isActive && mobileSearchPanelStyles.chipTextActive,
                          ]}
                        >
                          {categoria.categoria_nome}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            <View style={mobileSearchPanelStyles.actionsRow}>
              <TouchableOpacity style={mobileSearchPanelStyles.clearButton} onPress={handleClearFilters}>
                <Text style={mobileSearchPanelStyles.clearButtonText}>Limpar filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity style={mobileSearchPanelStyles.searchButton} onPress={handleSearch}>
                <Ionicons name="search" size={18} color="#ffffff" />
                <Text style={mobileSearchPanelStyles.searchButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default MobileSearchPanel;
