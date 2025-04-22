import { Tipo } from "../entities/tipo.entity";

export type CreateTipoData = Omit<Tipo, 'tipo_id' | 'ativo'>;
export type UpdateTipoData = Partial<Pick<Tipo, 'tipo_nome'>>;

export interface TipoRepository {
    findByNome(nome: string): Promise<Tipo | null>;
    criar(data: CreateTipoData): Promise<Tipo>;
    listar(apenasAtivos?: boolean): Promise<Tipo[]>;
    buscarPorId(id: number, incluirInativos?: boolean): Promise<Tipo | null>;
    atualizar(id: number, data: UpdateTipoData): Promise<Tipo | null>;
    excluir(id: number): Promise<boolean>;
}