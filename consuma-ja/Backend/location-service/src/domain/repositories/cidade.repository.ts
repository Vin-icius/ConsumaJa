import { Cidade } from '../entities/cidade.entity';

export interface CidadeRepository {
    
  findAll(params?: { nome?: string; estadoSigla?: string; ddd?: string }): Promise<Cidade[]>;
  findById(id: number): Promise<Cidade | null>; // Busca por ID simples
  findByEstadoId(estadoId: number): Promise<Cidade[]>;
  findByNomeAndEstadoId(nome: string, estadoId: number): Promise<Cidade | null>;
  create(data: Omit<Cidade, 'cidade_id'>): Promise<Cidade>;
  update(id: number, data: Partial<Omit<Cidade, 'cidade_id' | 'estado_id'>>): Promise<Cidade | null>;
  delete(id: number): Promise<boolean>;
  findOrCreate(nome: string, ddd: string, estadoId: number): Promise<Cidade>;
}