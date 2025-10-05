import React from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { relatoriosStyles as styles } from '../../common/styles/Reports/relatoriosScreen.styled';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/appNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

// Tipagem para a navegação, permitindo pular do Drawer para o Stack
type RelatoriosNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<any, 'Relatorios'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// Lista de relatórios disponíveis. No futuro, você pode adicionar mais aqui.
const availableReports = [
  {
    id: '1',
    title: 'Relatório de Avaliações',
    icon: 'star-outline' as const, // O 'as const' ajuda na tipagem do ícone
    route: 'RelatorioAvaliacoes' as keyof RootStackParamList,
  },
  // {
  //   id: '2',
  //   title: 'Relatório de Vendas (Exemplo Futuro)',
  //   icon: 'cash-outline' as const,
  //   route: 'RelatorioVendas' as keyof RootStackParamList,
  // },
];

const RelatoriosScreen = () => {
  const navigation = useNavigation<RelatoriosNavigationProp>();

  const renderItem = ({ item }: { item: typeof availableReports[0] }) => (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={() => navigation.navigate(item.route)}
    >
      <Ionicons name={item.icon} size={28} color="#4CAF50" style={styles.itemIcon} />
      <Text style={styles.itemText}>{item.title}</Text>
      <Ionicons name="chevron-forward-outline" size={24} color="#ccc" style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Painel de Relatórios</Text>
      <FlatList
        data={availableReports}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
};

export default RelatoriosScreen;