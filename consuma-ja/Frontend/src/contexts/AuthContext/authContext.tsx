import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService from '../../services/authService';
import configService from '../../services/configService';
import { useApplication } from '../ApplicationContext/ApplicationContext';

type Nullable<T> = T | null;

type AuthCredentials = {
  login: string;
  senha: string;
};

type User = {
  pessoa_id: Nullable<number>;
  pessoa_nome: Nullable<string>;
  pessoa_email: Nullable<string>;
  tipo: Nullable<string>;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
};

type AuthContextValue = {
  user: Nullable<User>;
  isAuthenticated: boolean;
  isLoading: boolean;
  twoFactorRequired: boolean;
  twoFactorPending: boolean;
  pendingToken: Nullable<string>;
  pendingUser: Nullable<User>;
  login: (credentials: AuthCredentials, skip2FACheck?: boolean) => Promise<void>;
  checkTwoFactorStatus: (identifier: string) => Promise<boolean>;
  verifyTwoFactor: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  enableTwoFactor: () => Promise<{ qrCodeUrl: string; secret: string } | undefined>;
  disableTwoFactor: () => Promise<void>;
  confirmTwoFactorSetup: (code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user: applicationUser,
    setAuthenticatedUser,
    setUserData,
    clearSession: clearApplicationSession,
    validateActiveSession,
  } = useApplication();

  const [user, setUser] = useState<Nullable<User>>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [pendingToken, setPendingToken] = useState<Nullable<string>>(null);
  const [pendingUser, setPendingUser] = useState<Nullable<User>>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    if (applicationUser) {
      setUser(mapUserFromResponse(applicationUser));
    } else {
      setUser(null);
    }
  }, [applicationUser]);

  const checkAuthState = async () => {
    try {
      await validateActiveSession();
    } catch (error) {
      console.error('[AuthContext] Erro ao recuperar estado de autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapUserFromResponse = (rawUser: any): User => ({
    pessoa_id: rawUser?.pessoa_id ?? rawUser?.id ?? null,
    pessoa_nome: rawUser?.pessoa_nome ?? rawUser?.nome ?? null,
    pessoa_email: rawUser?.pessoa_email ?? rawUser?.email ?? null,
    tipo: rawUser?.tipo ?? null,
  });

  const checkTwoFactorStatus = async (identifier: string): Promise<boolean> => {
    try {
      const response = await configService.verificar2FAUsuario(identifier);
      return Boolean(response?.autenticacao_2fa);
    } catch (error) {
      console.error('[AuthContext] Erro ao verificar status de 2FA:', error);
      return false;
    }
  };

  const login = async (credentials: AuthCredentials, skip2FACheck = false) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      const mappedUser = mapUserFromResponse(response.user);

      if (skip2FACheck) {
        setAuthenticatedUser({ user: response.user, token: response.token, session: response.session });
        setUser(mappedUser);
        setTwoFactorRequired(false);
        setTwoFactorPending(false);
        setPendingToken(null);
        setPendingUser(null);
        return;
      }

      if (response.twoFactorRequired) {
        if (!response.twoFactorToken) {
          throw new Error('Token de verificação 2FA não retornado pelo servidor.');
        }

        setTwoFactorRequired(true);
        setTwoFactorPending(true);
        setPendingToken(response.twoFactorToken);
        setPendingUser(mappedUser);
        return;
      }

      if (!response.token) {
        throw new Error('Token de autenticação não retornado pelo servidor.');
      }

      setAuthenticatedUser({ user: response.user, token: response.token, session: response.session });
      setUser(mappedUser);
      setTwoFactorRequired(false);
      setTwoFactorPending(false);
      setPendingToken(null);
      setPendingUser(null);
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
        throw new Error('Nenhuma verificação de 2FA pendente.');
      }

      const authResponse = await authService.verifyTwoFactor(pendingToken, code);

      if (!authResponse?.token || !authResponse?.user) {
        throw new Error('Resposta inválida do servidor ao confirmar 2FA.');
      }

      const validatedUser = mapUserFromResponse(authResponse.user);

      setAuthenticatedUser({ user: authResponse.user, token: authResponse.token, session: authResponse.session });
      setUser(validatedUser);

      setTwoFactorRequired(false);
      setTwoFactorPending(false);
      setPendingToken(null);
      setPendingUser(null);
    } catch (error) {
      console.error('[AuthContext] Erro na verificação 2FA:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await clearApplicationSession();
      setUser(null);
      setTwoFactorRequired(false);
      setTwoFactorPending(false);
      setPendingToken(null);
      setPendingUser(null);
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout:', error);
      throw error;
    }
  };

  const resolveCurrentUserId = async (): Promise<number> => {
    const currentUserId = applicationUser?.pessoa_id ?? user?.pessoa_id ?? null;

    if (currentUserId) {
      return currentUserId;
    }

    const latestUser = await validateActiveSession();
    const refreshedId = latestUser?.pessoa_id ?? applicationUser?.pessoa_id ?? user?.pessoa_id ?? null;

    if (!refreshedId) {
      throw new Error('Usuário não autenticado.');
    }

    return refreshedId;
  };

  const enableTwoFactor = async () => {
    const currentUserId = await resolveCurrentUserId();
    const response = await configService.atualizarConfiguracao2FA(currentUserId, true);

    if (user) {
      setUser({ ...user, twoFactorEnabled: true });
    }

    return response;
  };

  const disableTwoFactor = async () => {
    const currentUserId = await resolveCurrentUserId();
    await configService.atualizarConfiguracao2FA(currentUserId, false);

    if (user) {
      setUser({ ...user, twoFactorEnabled: false });
    }
  };

  const confirmTwoFactorSetup = async (code: string) => {
    const currentUserId = await resolveCurrentUserId();
    const response = await configService.validarCodigo2FA(currentUserId, code);

    if (!response?.valido) {
      throw new Error('Código 2FA inválido.');
    }

    if (user) {
      setUser({ ...user, twoFactorEnabled: true });
    }
  };

  const refreshUser = async () => {
    try {
      const current = await validateActiveSession();
      if (current) {
        setUser(mapUserFromResponse(current));
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
