import { Marca } from "../entities/marca.entity";

export type CreateMarcaData = Omit<Marca, 'marca_id' | 'ativo'>;
export type UpdateMarcaData = Partial<CreateMarcaData>;

export interface MarcaRepository {
    findByNome(nome: string): Promise<Marca | null>;
    criar(data: CreateMarcaData): Promise<Marca>;
    listar(apenasAtivos?: boolean): Promise<Marca[]>;
    buscarPorId(id: number, incluirInativos?: boolean): Promise<Marca | null>;
    atualizar(id: number, data: UpdateMarcaData): Promise<Marca | null>;
    excluir(id: number): Promise<boolean>; // Exclusão lógica
}