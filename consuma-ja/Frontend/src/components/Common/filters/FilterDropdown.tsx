import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { filterDropdownStyles } from './filterDropdown.styled';

interface Option {
  label: string;
  value: any;
  subOptions?: Option[];
}

interface FilterDropdownProps {
  options: Option[];
  value: any[];
  onValueChange: (value: any) => void;
  placeholder: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ options, value, onValueChange, placeholder }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const handleSelect = (option: Option) => {
    if (option.subOptions) {
      setActiveSubmenu(option.value);
    } else {
      onValueChange(option.value);
      setDropdownVisible(false);
      setActiveSubmenu(null);
    }
  };

  const handleBack = () => {
    setActiveSubmenu(null);
  };

  const currentOptions = activeSubmenu
    ? options.find(opt => opt.value === activeSubmenu)?.subOptions || []
    : options;

  return (
    <View style={filterDropdownStyles.container}>
      <TouchableOpacity style={filterDropdownStyles.selectButton} onPress={() => setDropdownVisible(!dropdownVisible)}>
        <Ionicons name="options-outline" size={20} color="#333" />
      </TouchableOpacity>

      {dropdownVisible && (
        <View style={filterDropdownStyles.dropdownContainer}>
          <View style={filterDropdownStyles.arrow} />
          <View style={filterDropdownStyles.dropdown}>
            {activeSubmenu && (
              <TouchableOpacity style={filterDropdownStyles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={20} color="#333" />
                <Text style={filterDropdownStyles.backText}>Voltar</Text>
              </TouchableOpacity>
            )}
            <FlatList
              data={currentOptions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[filterDropdownStyles.option, value.includes(item.value) && item.value !== 'clear' && filterDropdownStyles.selectedOption]}
                  onPress={() => handleSelect(item)}
                >
                  {item.value !== 'clear' && (
                    <Ionicons name={value.includes(item.value) ? "checkbox" : "square-outline"} size={16} color="#333" style={{ marginRight: 15 }} />
                  )}
                  <Text style={[filterDropdownStyles.optionText, value.includes(item.value) && item.value !== 'clear' && filterDropdownStyles.selectedOptionText]}>
                    {item.label}
                  </Text>
                  {item.subOptions && <Ionicons name="chevron-forward" size={16} color="#333" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default FilterDropdown;
