import { Tipo } from "../entities/tipo.entity";

export interface TipoRepository {
    criar(tipo: Tipo): Promise<Tipo>;
    listar(): Promise<Tipo[]>;
    buscarPorId(id: number): Promise<Tipo | null>;
    atualizar(tipo: Tipo): Promise<Tipo>;
    excluir(id: number): Promise<void>;
  }