let currentToken = null;

export const setAuthToken = (token) => {
  currentToken = token ?? null;
};

export const getAuthToken = () => currentToken;
