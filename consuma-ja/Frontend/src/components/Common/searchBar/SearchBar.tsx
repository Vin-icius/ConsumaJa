import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customHeaderStyles } from '../customHeader/customHeader.styled';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, value, onChangeText, onSubmitEditing }) => {
  return (
    <TextInput
      placeholder={placeholder}
      style={customHeaderStyles.searchInput}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      returnKeyType="search"
    />
  );
};

export default SearchBar;
