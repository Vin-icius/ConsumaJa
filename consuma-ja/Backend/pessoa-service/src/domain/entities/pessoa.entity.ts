import { Fisica } from './fisica.entity';
import { Juridica } from './juridica.entity';

export type PessoaTipo = 'Fisica' | 'Juridica' | 'Admin';
export type PessoaStatus = 0 | 1; // 0=Inativo, 1=Ativo

export interface Pessoa {
  pessoa_id: number;
  pessoa_nome: string;
  pessoa_email: string;
  pessoa_telefone: string | null;
  pessoa_tipo: PessoaTipo;
  pessoa_login: string;
  pessoa_senha?: string; // Senha não deve ser retornada em todas as buscas
  pessoa_status: PessoaStatus;
  data_criacao: Date | null;
  ativo: boolean;

  fisica?: Fisica | null;
  juridica?: Juridica | null;
  endereco?: any | null; // Dados de endereço com cidade e estado
}