interface SessionInfo {
  id: string;
  expiraEm: string;
  dadosUsuario: Record<string, unknown>;
}

export interface AuthResponseDto {
  token?: string;
  user: Record<string, unknown>;
  session?: SessionInfo;
  twoFactorRequired?: boolean;
  twoFactorToken?: string;
  message?: string;
}