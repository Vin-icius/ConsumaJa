import { Produto } from "../entities/produto.entity";

// Dados para criação: Inclui FKs, omite IDs/Datas/Status/Ativo/Objetos relacionados
export type CreateProdutoData = Omit<Produto,
  'produto_id' | 'produto_status' | 'motivo' | 'data_registro' |
  'data_aprovacao' | 'data_exclusao' | 'ativo' |
  'categoria' | 'marca' | 'tipo'
>;

// Dados para atualização: Parcial, permite alterar campos editáveis
export type UpdateProdutoData = Partial<Omit<Produto,
  'produto_id' | 'produto_status' | 'motivo' | 'data_registro' |
  'data_aprovacao' | 'data_exclusao' | 'ativo' |
  'categoria' | 'marca' | 'tipo' // Não permite mudar FKs diretamente aqui
>>;

export interface ProdutoRepository {

    criar(data: CreateProdutoData): Promise<Produto>;
    listar(apenasAtivos?: boolean, filtros?: any): Promise<Produto[]>;
    buscarPorId(id: number, incluirInativos?: boolean): Promise<Produto | null>;
    atualizar(id: number, data: UpdateProdutoData): Promise<Produto | null>;
    excluir(id: number): Promise<boolean>;

    // Métodos específicos do fluxo de aprovação
    listarPendentes(apenasAtivos?: boolean): Promise<Produto[]>;
    aprovar(id: number): Promise<Produto | null>;
    rejeitar(id: number, motivo: string): Promise<Produto | null>;
    findByNome(nome: string): Promise<Produto | null>;
}