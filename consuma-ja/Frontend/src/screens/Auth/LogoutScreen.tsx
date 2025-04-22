import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Exemplo de tipo

// Definir um tipo para sua pilha principal se ainda não tiver
// type RootStackParamList = {
//   Login: undefined;
//   Dashboard: undefined;
//   // ... outras rotas do Stack
// };
// type LogoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sair'>;

const LogoutScreen = () => {
  // Usar tipo específico se disponível, senão 'any'
  const navigation = useNavigation<any>();

  useEffect(() => {
    const performLogout = () => {
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair?',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => navigation.goBack() },
          { text: 'Sair', style: 'destructive', onPress: async () => {
              try {
                console.log('[LogoutScreen] Removendo userType...');
                await AsyncStorage.removeItem('userType');
                // await AsyncStorage.removeItem('userToken'); // Remover token JWT também!
                console.log('[LogoutScreen] Redirecionando para Login...');
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } catch (e) {
                console.error("[LogoutScreen] Erro:", e);
                Alert.alert("Erro", "Não foi possível completar o logout.");
                navigation.goBack();
              }
           }},
        ],
        { cancelable: false }
      );
    };
    const timer = setTimeout(performLogout, 50); // Pequeno delay
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2F4F4F" />
      <Text style={styles.text}>Saindo...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  text: { marginTop: 10, fontSize: 16, color: '#555' }
});

export default LogoutScreen;