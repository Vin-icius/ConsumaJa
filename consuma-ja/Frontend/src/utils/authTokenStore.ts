let currentToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentToken = token ?? null;
};

export const getAuthToken = () => currentToken;
