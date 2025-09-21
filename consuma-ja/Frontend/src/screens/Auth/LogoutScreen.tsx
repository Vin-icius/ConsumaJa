import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext/authContext';
import { logoutStyles } from '../../common/styles/Auth/logoutScreen.styled';

const LogoutScreen = () => {
  const { logout, isLoading } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('[LogoutScreen] Iniciando logout...');
        await logout();
        console.log('[LogoutScreen] Logout realizado com sucesso');
        // A navegação será feita automaticamente pelo AuthNavigator
        // quando o estado de autenticação mudar
      } catch (error) {
        console.error('[LogoutScreen] Erro durante logout:', error);
        Alert.alert(
          'Erro',
          'Não foi possível completar o logout. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
    };

    // Pequeno delay para mostrar o loading
    const timer = setTimeout(performLogout, 100);
    return () => clearTimeout(timer);
  }, [logout]);

  return (
    <View style={logoutStyles.container}>
      <ActivityIndicator size="large" color="#2F4F4F" />
      <Text style={logoutStyles.text}>Saindo...</Text>
    </View>
  );
};

export default LogoutScreen;