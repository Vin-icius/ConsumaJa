import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { logoutStyles } from '../../common/styles/Auth/logoutScreen.styled';

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
    const timer = setTimeout(performLogout, 50);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={logoutStyles.container}>
      <ActivityIndicator size="large" color="#2F4F4F" />
      <Text style={logoutStyles.text}>Saindo...</Text>
    </View>
  );
};

export default LogoutScreen;