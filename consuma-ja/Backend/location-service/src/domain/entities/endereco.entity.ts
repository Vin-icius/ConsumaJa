import { Cidade } from "./cidade.entity"; 


export interface Endereco {
  endereco_id: number;
  rua: string;
  bairro: string;
  numero: string;
  cep: string;
  complemento: string | null;
  CIDADE_cidade_id: number;
  PESSOA_pessoa_id: number;
  ativo: boolean;

  cidade?: Pick<Cidade, 'cidade_id' | 'cidade_nome' | 'estado_id'> & {
    estado?: { estado_sigla?: string, estado_nome?: string }
  };
}