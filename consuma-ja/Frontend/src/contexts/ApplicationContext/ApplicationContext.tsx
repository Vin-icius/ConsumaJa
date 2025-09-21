import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  pessoa_id: number | null;
  tipo: string | null;
  pessoa_nome: string | null;
  pessoa_email: string | null;
  twoFactorEnabled?: boolean;
}

interface ApplicationContextType {
  // Dados do usuário logado
  userId: number | null;
  userType: string | null;
  userName: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;

  // Token de autenticação
  token: string | null;

  // Métodos para atualizar dados
  setUserData: (userData: Partial<User & { token?: string }>) => void;
  clearUserData: () => void;
  refreshUserData: () => Promise<void>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

interface ApplicationProviderProps {
  children: ReactNode;
}

export const ApplicationProvider: React.FC<ApplicationProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Carregar dados do usuário do AsyncStorage quando o app inicia
  useEffect(() => {
    loadUserDataFromStorage();
  }, []);

  const loadUserDataFromStorage = async () => {
    try {
      const [
        storedToken,
        storedUserId,
        storedUserType,
        storedUserName,
        storedUserEmail
      ] = await AsyncStorage.multiGet([
        'userToken',
        'userId',
        'userType',
        'userName',
        'userEmail'
      ]);

      setToken(storedToken[1]);
      setUserId(storedUserId[1] ? parseInt(storedUserId[1]) : null);
      setUserType(storedUserType[1]);
      setUserName(storedUserName[1]);
      setUserEmail(storedUserEmail[1]);

      console.log('[ApplicationContext] Dados carregados:', {
        userId: storedUserId[1],
        userType: storedUserType[1],
        userName: storedUserName[1],
        userEmail: storedUserEmail[1],
        hasToken: !!storedToken[1]
      });
    } catch (error) {
      console.error('[ApplicationContext] Erro ao carregar dados:', error);
    }
  };

  const setUserData = (userData: Partial<User & { token?: string }>) => {
    console.log('[ApplicationContext] Atualizando dados:', userData);

    if (userData.pessoa_id !== undefined) setUserId(userData.pessoa_id);
    if (userData.tipo !== undefined) setUserType(userData.tipo);
    if (userData.pessoa_nome !== undefined) setUserName(userData.pessoa_nome);
    if (userData.pessoa_email !== undefined) setUserEmail(userData.pessoa_email);
    if (userData.token !== undefined) setToken(userData.token);

    // Salvar no AsyncStorage
    if (userData.pessoa_id !== undefined && userData.pessoa_id !== null) {
      AsyncStorage.setItem('userId', userData.pessoa_id.toString());
    }
    if (userData.tipo !== undefined && userData.tipo !== null) {
      AsyncStorage.setItem('userType', userData.tipo);
    }
    if (userData.pessoa_nome !== undefined && userData.pessoa_nome !== null) {
      AsyncStorage.setItem('userName', userData.pessoa_nome);
    }
    if (userData.pessoa_email !== undefined && userData.pessoa_email !== null) {
      AsyncStorage.setItem('userEmail', userData.pessoa_email);
    }
    if (userData.token !== undefined && userData.token !== null) {
      AsyncStorage.setItem('userToken', userData.token);
    }
  };

  const clearUserData = () => {
    console.log('[ApplicationContext] Limpando dados do usuário');

    setUserId(null);
    setUserType(null);
    setUserName(null);
    setUserEmail(null);
    setToken(null);

    // Limpar AsyncStorage
    AsyncStorage.multiRemove(['userToken', 'userId', 'userType', 'userName', 'userEmail']);
  };

  const refreshUserData = async () => {
    await loadUserDataFromStorage();
  };

  const value: ApplicationContextType = {
    userId,
    userType,
    userName,
    userEmail,
    token,
    isAuthenticated: !!(userId && token),
    setUserData,
    clearUserData,
    refreshUserData,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};