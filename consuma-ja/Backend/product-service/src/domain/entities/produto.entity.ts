import { Categoria } from "./categoria.entity";
import { Marca } from "./marca.entity";
import { Tipo } from "./tipo.entity";


export interface Produto {
  produto_id: number;
  produto_nome: string;
  produto_status: 'APROVADO' | 'PENDENTE' | 'REJEITADO'; // Enum do DB
  produto_medida: string;
  produto_precoOriginal: number; // DECIMAL vira number
  motivo: string | null;
  descricao: string | null;
  data_registro: Date;
  data_aprovacao: Date | null;
  data_exclusao: Date | null;
  ativo: boolean; // Para exclusão lógica

  // Chaves estrangeiras (números) - Nomes das colunas no DB
  CATEGORIA_PRODUTO_categoria_id: number;
  MARCA_PRODUTO_marca_id: number;
  TIPO_PRODUTO_tipo_id: number;

  // Propriedades para os objetos relacionados (podem ser null)
  categoria: Categoria | null;
  marca: Marca | null;         
  tipo: Tipo | null; 
}