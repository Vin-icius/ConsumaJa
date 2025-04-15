import { Marca } from '../entities/marca.entity';

export interface MarcaRepository {
    criar(marca: Marca): Promise<Marca>;
    listar(): Promise<Marca[]>;
    buscarPorId(id: number): Promise<Marca | null>;
    atualizar(marca: Marca): Promise<Marca>;
    excluir(id: number): Promise<void>;
  }