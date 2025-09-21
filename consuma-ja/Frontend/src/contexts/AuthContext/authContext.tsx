import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../services/authService';
import configService from '../../services/configService';
import { useApplication } from '../ApplicationContext/ApplicationContext';

interface User {
  pessoa_id: number | null;
  pessoa_nome: string | null;
  pessoa_email: string | null;
  tipo: string | null;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  twoFactorRequired: boolean;
  twoFactorPending: boolean;
  pendingToken: string | null;
  pendingUser: User | null;
  login: (credentials: { login: string; senha: string }, skip2FACheck?: boolean) => Promise<void>;
  checkTwoFactorStatus: (identifier: string) => Promise<boolean>;
  verifyTwoFactor: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  enableTwoFactor: () => Promise<{ qrCodeUrl: string; secret: string }>;
  disableTwoFactor: () => Promise<void>;
  confirmTwoFactorSetup: (code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { userId, setUserData, clearUserData, refreshUserData } = useApplication();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await authService.getToken();
      const currentUser = await authService.getCurrentUser();

      if (token && currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTwoFactorStatus = async (identifier: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Verificando status 2FA para identificador:', identifier);
      const response = await configService.verificar2FAUsuario(identifier);
      console.log('[AuthContext] Resposta completa do backend:', JSON.stringify(response));
      const has2FA = response?.autenticacao_2fa || false;
      console.log('[AuthContext] Status 2FA processado:', has2FA, 'tipo:', typeof has2FA);
      return Boolean(has2FA);
    } catch (error) {
      console.error('[AuthContext] Erro ao verificar status 2FA:', error);
      // Em caso de erro, assume que não tem 2FA
      return false;
    }
  };

  const login = async (credentials: { login: string; senha: string }, skip2FACheck: boolean = false) => {
    try {
      setIsLoading(true);
      console.log('[AuthContext] Iniciando login para:', credentials.login, 'skip2FACheck:', skip2FACheck);

      const response = await authService.login(credentials);
      console.log('[AuthContext] Login response:', response);

      if (skip2FACheck) {
        // Pular verificação 2FA - login normal
        console.log('[AuthContext] Pulando verificação 2FA, fazendo login normal');
        await authService.storeAuthData(response.token, response.user);
        setUser({
          pessoa_id: response.user?.pessoa_id || response.user?.id,
          tipo: response.user?.tipo,
          pessoa_nome: response.user?.pessoa_nome || response.user?.nome,
          pessoa_email: response.user?.pessoa_email || response.user?.email,
        });
        // Atualizar ApplicationContext
        setUserData({
          pessoa_id: response.user?.pessoa_id || response.user?.id,
          tipo: response.user?.tipo,
          pessoa_nome: response.user?.pessoa_nome || response.user?.nome,
          pessoa_email: response.user?.pessoa_email || response.user?.email,
          token: response.token
        });
        return;
      }

      // SEMPRE verificar se usuário tem 2FA habilitado consultando configurações
      let userHas2FA = false;
      try {
        // Mapear pessoa_id do usuário retornado pelo login
        const userId = response.user?.pessoa_id || response.user?.id;
        console.log('[AuthContext] Mapeando pessoa_id:', userId, 'de response.user:', response.user);

        if (userId) {
          console.log('[AuthContext] Consultando configurações para pessoa_id:', userId);
          const configData = await configService.getConfiguracoesUsuario(userId);
          userHas2FA = configData?.autenticacao_2fa || false;
          console.log('[AuthContext] Status 2FA obtido:', userHas2FA, 'dados completos:', JSON.stringify(configData));
        } else {
          console.warn('[AuthContext] pessoa_id/id não encontrado na resposta do login');
        }
      } catch (configError) {
        console.error('[AuthContext] Erro ao consultar configurações 2FA:', configError);
        console.error('[AuthContext] Detalhes do erro:', (configError as any)?.response?.data || (configError as Error)?.message);
        // Em caso de erro, assume que NÃO tem 2FA para não bloquear login
        userHas2FA = false;
      }

      if (userHas2FA) {
        // Usuário tem 2FA habilitado, SEMPRE forçar verificação
        console.log('[AuthContext] Usuário tem 2FA habilitado - redirecionando para verificação 2FA');
        setTwoFactorRequired(true);
        setTwoFactorPending(true);
        setPendingToken(response.token);
        setPendingUser({
          pessoa_id: response.user?.pessoa_id || response.user?.id,
          tipo: response.user?.tipo,
          pessoa_nome: response.user?.pessoa_nome || response.user?.nome,
          pessoa_email: response.user?.pessoa_email || response.user?.email,
        });
        // NÃO completar o login ainda - aguardar validação 2FA
      } else {
        // Normal login without 2FA
        console.log('[AuthContext] Usuário NÃO tem 2FA habilitado - completando login normal');
        await authService.storeAuthData(response.token, response.user);
        setUser({
          pessoa_id: response.user?.pessoa_id || response.user?.id,
          tipo: response.user?.tipo,
          pessoa_nome: response.user?.pessoa_nome || response.user?.nome,
          pessoa_email: response.user?.pessoa_email || response.user?.email,
        });
        // Atualizar ApplicationContext
        setUserData({
          pessoa_id: response.user?.pessoa_id || response.user?.id,
          tipo: response.user?.tipo,
          pessoa_nome: response.user?.pessoa_nome || response.user?.nome,
          pessoa_email: response.user?.pessoa_email || response.user?.email,
          token: response.token
        });
      }
    } catch (error) {
      console.error('[AuthContext] Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactor = async (code: string) => {
    try {
      setIsLoading(true);

      if (!pendingToken) {
        throw new Error('No pending 2FA verification');
      }

      // Se temos um tempToken (do backend), usar endpoint de verify-2fa
      // Se temos um token completo (do frontend), usar endpoint de validar código 2FA
      let response;
      if (pendingToken && pendingToken.length < 100) { // tempToken é menor
        response = await authService.verifyTwoFactor(pendingToken, code);
      } else {
        // Token completo - validar código 2FA diretamente
        if (!pendingUser?.pessoa_id) {
          throw new Error('User ID not available for 2FA validation');
        }
        const validationResponse = await configService.validarCodigo2FA(pendingUser.pessoa_id, code);
        if (!validationResponse.valido) {
          throw new Error('Código 2FA inválido');
        }
        // Simular resposta de login bem-sucedido
        response = {
          token: pendingToken,
          user: pendingUser
        };
      }

      // Store auth data and update state
      await authService.storeAuthData(response.token, pendingUser!);
      setUser(pendingUser);

      // Atualizar ApplicationContext
      if (pendingUser) {
        setUserData({
          pessoa_id: pendingUser.pessoa_id,
          tipo: pendingUser.tipo,
          pessoa_nome: pendingUser.pessoa_nome,
          pessoa_email: pendingUser.pessoa_email,
          token: response.token
        });
      }

      // Reset 2FA states
      setTwoFactorRequired(false);
      setTwoFactorPending(false);
      setPendingToken(null);
      setPendingUser(null);
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.clearAuthData();
      setUser(null);
      setTwoFactorRequired(false);
      setTwoFactorPending(false);
      setPendingToken(null);
      setPendingUser(null);

      // Limpar ApplicationContext
      setUserData({
        pessoa_id: null,
        tipo: null,
        pessoa_nome: null,
        pessoa_email: null,
        token: undefined
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const enableTwoFactor = async () => {
    try {
      // Primeiro tentar usar userId do ApplicationContext
      let currentUserId = userId;

      // Se não estiver disponível, tentar usar do estado local do AuthContext
      if (!currentUserId && user?.pessoa_id) {
        currentUserId = user.pessoa_id;
      }

      // Se ainda não tiver, tentar recarregar dados do ApplicationContext
      if (!currentUserId) {
        await refreshUserData();
        currentUserId = userId;
      }

      if (!currentUserId) {
        throw new Error('Usuário não autenticado');
      }

      const response = await configService.atualizarConfiguracao2FA(currentUserId, true);

      // Atualizar estado do usuário para refletir que 2FA está habilitado
      if (user) {
        setUser({ ...user, twoFactorEnabled: true });
      }

      return response;
    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw error;
    }
  };

  const disableTwoFactor = async () => {
    try {
      // Primeiro tentar usar userId do ApplicationContext
      let currentUserId = userId;

      // Se não estiver disponível, tentar usar do estado local do AuthContext
      if (!currentUserId && user?.pessoa_id) {
        currentUserId = user.pessoa_id;
      }

      // Se ainda não tiver, tentar recarregar dados do ApplicationContext
      if (!currentUserId) {
        await refreshUserData();
        currentUserId = userId;
      }

      if (!currentUserId) {
        throw new Error('Usuário não autenticado');
      }

      await configService.atualizarConfiguracao2FA(currentUserId, false);
      if (user) {
        setUser({ ...user, twoFactorEnabled: false });
      }
    } catch (error) {
      console.error('Disable 2FA error:', error);
      throw error;
    }
  };

  const confirmTwoFactorSetup = async (code: string) => {
    try {
      // Primeiro tentar usar userId do ApplicationContext
      let currentUserId = userId;

      // Se não estiver disponível, tentar usar do estado local do AuthContext
      if (!currentUserId && user?.pessoa_id) {
        currentUserId = user.pessoa_id;
      }

      // Se ainda não tiver, tentar recarregar dados do ApplicationContext
      if (!currentUserId) {
        await refreshUserData();
        currentUserId = userId;
      }

      if (!currentUserId) {
        throw new Error('Usuário não autenticado');
      }

      const response = await configService.validarCodigo2FA(currentUserId, code);
      if (response.valido) {
        if (user) {
          setUser({ ...user, twoFactorEnabled: true });
        }
        return response;
      } else {
        throw new Error('Código 2FA inválido');
      }
    } catch (error) {
      console.error('Confirm 2FA setup error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    twoFactorRequired,
    twoFactorPending,
    pendingToken,
    pendingUser,
    login,
    checkTwoFactorStatus,
    verifyTwoFactor,
    logout,
    enableTwoFactor,
    disableTwoFactor,
    confirmTwoFactorSetup,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};