import { Fisica } from './fisica.entity';
import { Juridica } from './juridica.entity';

export type PessoaTipo = 'Fisica' | 'Juridica' | 'Admin';
export type PessoaStatus = 0 | 1; // 0=Inativo, 1=Ativo

export interface PessoaEndereco {
  endereco_id: number;
  endereco_rua: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_cep: string;
  endereco_complemento: string | null;
  cidade_id: number | null;
  cidade_nome?: string | null;
  estado_id?: number | null;
  estado_nome?: string | null;
  estado_sigla?: string | null;
}

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

  pessoa_cpf?: string | null;
  pessoa_cnpj?: string | null;
  pessoa_num_fornecedor?: number | null;
  documento?: string | null;
  endereco?: PessoaEndereco | null;

  fisica?: Fisica | null;
  juridica?: Juridica | null;
}