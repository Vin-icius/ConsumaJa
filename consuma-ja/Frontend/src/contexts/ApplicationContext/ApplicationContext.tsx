import React, { createContext, useContext, useMemo, useState, useCallback, ReactNode } from 'react';
import authService from '../../services/authService';
import { setAuthToken } from '../../utils/authTokenStore';

type Nullable<T> = T | null;

type PessoaTipo = 'Fisica' | 'Juridica' | 'Admin' | '';

interface ApplicationUser {
  id: Nullable<number>;
  pessoa_id: Nullable<number>;
  nome: string;
  pessoa_nome: string;
  email: string;
  pessoa_email: string;
  tipo: PessoaTipo;
  pessoa_tipo: PessoaTipo;
  [key: string]: any;
}

interface SetAuthenticatedUserPayload {
  user: Record<string, unknown>;
  token: string;
  session?: {
    id?: string;
    expiraEm?: string;
    dadosUsuario?: Record<string, unknown> | null;
  } | null;
}

interface ApplicationContextValue {
  user: Nullable<ApplicationUser>;
  token: Nullable<string>;
  sessionId: Nullable<string>;
  sessionExpiresAt: Nullable<string>;
  isAuthenticated: boolean;
  isValidatingSession: boolean;
  setAuthenticatedUser: (payload: SetAuthenticatedUserPayload) => void;
  setUserData: (userData: Record<string, unknown>) => void;
  clearSession: (notifyServer?: boolean) => Promise<void>;
  validateActiveSession: () => Promise<Nullable<ApplicationUser>>;
}

const ApplicationContext = createContext<ApplicationContextValue | undefined>(undefined);

interface ApplicationProviderProps {
  children: ReactNode;
}

const normalizeUserFields = (raw: Record<string, unknown> = {}): ApplicationUser => {
  const numericId = raw?.pessoa_id ?? raw?.id;
  const resolvedId = numericId === null || numericId === undefined ? null : Number(numericId);

  const nomeValue = String(raw?.pessoa_nome ?? raw?.nome ?? '').trim();
  const emailValue = String(raw?.pessoa_email ?? raw?.email ?? '').trim();
  const tipoValue = (raw?.pessoa_tipo ?? raw?.tipo ?? '') as PessoaTipo;

  return {
    id: resolvedId,
    pessoa_id: resolvedId,
    nome: nomeValue,
    pessoa_nome: nomeValue,
    email: emailValue,
    pessoa_email: emailValue,
    tipo: tipoValue,
    pessoa_tipo: tipoValue,
    ...raw,
  } as ApplicationUser;
};

export const ApplicationProvider: React.FC<ApplicationProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Nullable<ApplicationUser>>(null);
  const [token, setToken] = useState<Nullable<string>>(null);
  const [sessionId, setSessionId] = useState<Nullable<string>>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Nullable<string>>(null);
  const [isValidatingSession, setIsValidatingSession] = useState(false);

  const setUserData = useCallback((userData: Record<string, unknown>) => {
    setUser((prev) => {
      const merged = {
        ...(prev ?? {}),
        ...(userData ?? {}),
      } as Record<string, unknown>;
      return normalizeUserFields(merged);
    });
  }, []);

  const setAuthenticatedUser = useCallback(
    ({ user: rawUser, token: rawToken, session }: SetAuthenticatedUserPayload) => {
      const sourceUser = (session?.dadosUsuario ?? rawUser) as Record<string, unknown>;
      const normalizedUser = normalizeUserFields(sourceUser);
      setUser(normalizedUser);
      setToken(rawToken ?? null);
      setAuthToken(rawToken ?? null);
      setSessionId(session?.id ?? null);
      setSessionExpiresAt(session?.expiraEm ?? null);
    },
    [],
  );

  const clearSession = useCallback(
    async (notifyServer = true) => {
      if (notifyServer && sessionId) {
        try {
          await authService.encerrarSessao(sessionId);
        } catch (error) {
          console.warn('[ApplicationContext] Falha ao encerrar sessão no servidor:', error);
        }
      }

      setAuthToken(null);
      setUser(null);
      setToken(null);
      setSessionId(null);
      setSessionExpiresAt(null);
      setIsValidatingSession(false);
    },
    [sessionId],
  );

  const validateActiveSession = useCallback(async () => {
    if (!sessionId) {
      return null;
    }

    setIsValidatingSession(true);

    try {
  const validation = await authService.validarSessao(sessionId);
  const sessionUser = (validation.session?.dadosUsuario ?? validation.user) as Record<string, unknown>;
  const normalizedUser = normalizeUserFields(sessionUser ?? {});
      setUser(normalizedUser);
      setSessionExpiresAt(validation.session?.expiraEm ?? null);
      return normalizedUser;
    } catch (error) {
      console.error('[ApplicationContext] Sessão inválida ou expirada:', error);
      await clearSession(false);
      return null;
    } finally {
      setIsValidatingSession(false);
    }
  }, [sessionId, clearSession]);

  const contextValue = useMemo<ApplicationContextValue>(
    () => ({
      user,
      token,
      sessionId,
      sessionExpiresAt,
      isAuthenticated: Boolean(user && token && sessionId),
      isValidatingSession,
      setAuthenticatedUser,
      setUserData,
      clearSession,
      validateActiveSession,
    }),
    [user, token, sessionId, sessionExpiresAt, isValidatingSession, setAuthenticatedUser, setUserData, clearSession, validateActiveSession],
  );

  return <ApplicationContext.Provider value={contextValue}>{children}</ApplicationContext.Provider>;
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};
