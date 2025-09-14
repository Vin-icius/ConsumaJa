import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { datePickerStyles } from './datePicker.styled';
import DateTimePicker from 'react-native-modal-datetime-picker';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
  label,
  minimumDate,
  maximumDate,
}) => {
  const formatDateForInput = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [showPicker, setShowPicker] = useState(false);
  const [inputValue, setInputValue] = useState(value ? formatDateForInput(value) : '');
  const [rawInputValue, setRawInputValue] = useState(value ? formatDateForInput(value) : '');
  const inputRef = useRef<TextInput>(null);

  const parseDateFromInput = (input: string): Date | null => {
    const parts = input.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Meses são 0-indexed
      const year = parseInt(parts[2], 10);

      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return null;
  };

  const applyDateMask = (text: string): string => {
    // Remover tudo que não é dígito
    let cleanText = text.replace(/\D/g, '');

    // Limitar a 8 dígitos (DDMMYYYY)
    cleanText = cleanText.substring(0, 8);

    // Aplicar máscara
    let formatted = cleanText;
    if (cleanText.length >= 2) {
      formatted = cleanText.substring(0, 2) + '/' + cleanText.substring(2);
    }
    if (cleanText.length >= 4) {
      formatted = cleanText.substring(0, 2) + '/' + cleanText.substring(2, 4) + '/' + cleanText.substring(4);
    }

    return formatted;
  };

  const handleInputChange = (text: string) => {
    // Permitir digitação livre sem máscara em tempo real
    setRawInputValue(text);
    setInputValue(text);
  };

  const handleInputBlur = () => {
    // Aplicar máscara apenas quando o campo perde o foco
    const maskedValue = applyDateMask(rawInputValue);
    setInputValue(maskedValue);
    setRawInputValue(maskedValue);

    // Tentar parsear a data apenas se estiver completa
    if (maskedValue.length === 10) {
      const parsedDate = parseDateFromInput(maskedValue);
      if (parsedDate) {
        onChange(parsedDate);
      } else {
        // Data inválida
        onChange(null);
      }
    } else {
      // Data incompleta
      onChange(null);
    }
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      // No mobile, abrir o DateTimePicker
      setShowPicker(true);
    }
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate);
      const formatted = formatDateForInput(selectedDate);
      setInputValue(formatted);
      setRawInputValue(formatted);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return placeholder;
    return date.toLocaleDateString('pt-BR');
  };

  // Atualizar inputValue quando value muda externamente
  useEffect(() => {
    if (value) {
      const formatted = formatDateForInput(value);
      setInputValue(formatted);
      setRawInputValue(formatted);
    } else if (!inputValue || inputValue.length !== 10) {
      setInputValue('');
      setRawInputValue('');
    }
  }, [value]);

  return (
    <View style={datePickerStyles.container}>
      {label && <Text style={datePickerStyles.label}>{label}</Text>}
      {Platform.OS === 'web' ? (
        <TextInput
          ref={inputRef}
          style={[datePickerStyles.webInput, !value && datePickerStyles.placeholderText]}
          value={inputValue}
          onChangeText={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          keyboardType="numeric"
          maxLength={10}
        />
      ) : (
        <TouchableOpacity
          style={datePickerStyles.input}
          onPress={handlePress}
        >
          <Text style={[datePickerStyles.inputText, !value && datePickerStyles.placeholderText]}>
            {formatDate(value)}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#555" />
        </TouchableOpacity>
      )}
      {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          date={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onConfirm={(selectedDate: Date) => { setShowPicker(false); onChange(selectedDate); }}
          onCancel={() => setShowPicker(false)}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

export default DatePicker;
