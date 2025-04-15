import { Categoria } from "../entities/categoria.entity";

export interface CategoriaRepository {
    criar(categoria: Categoria): Promise<Categoria>;
    listar(): Promise<Categoria[]>;
    buscarPorId(id: number): Promise<Categoria | null>;
    atualizar(categoria: Categoria): Promise<Categoria>;
    excluir(id: number): Promise<void>;
  }