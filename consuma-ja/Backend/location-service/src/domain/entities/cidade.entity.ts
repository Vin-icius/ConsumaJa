import { Estado } from './estado.entity';

export interface Cidade {
  cidade_id: number;
  cidade_nome: string;
  regiao_ddd: string;
  estado_id: number;
  estado?: Estado;
}