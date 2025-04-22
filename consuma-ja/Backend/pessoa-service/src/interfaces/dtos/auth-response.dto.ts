interface UserInfo {
  id: number;
  nome: string;
  email: string;
  tipo: 'Fisica' | 'Juridica' | 'Admin';
}

export class AuthResponseDto {
  // Adiciona '!' para indicar ao TS que serão inicializadas externamente
  token!: string;
  user!: UserInfo;
}