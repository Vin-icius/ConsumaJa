import { Categoria } from "../entities/categoria.entity";


export type CreateCategoriaData = Omit<Categoria, 'categoria_id' | 'ativo'>;
export type UpdateCategoriaData = Partial<Pick<Categoria, 'categoria_nome'>>;
export interface CategoriaRepository {

    findByNome(nome: string, fornecedorId?: number | null): Promise<Categoria | null>;
    criar(data: CreateCategoriaData): Promise<Categoria>;
    listar(apenasAtivos?: boolean): Promise<Categoria[]>;
    buscarPorId(id: number, incluirInativos?: boolean): Promise<Categoria | null>;
    atualizar(id: number, data: UpdateCategoriaData): Promise<Categoria | null>;
    excluir(id: number): Promise<boolean>;
}