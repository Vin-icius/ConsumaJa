import { Estado } from '../entities/estado.entity';

export interface EstadoRepository {
  findAll(params?: { nome?: string; sigla?: string }): Promise<Estado[]>;
  findById(id: number): Promise<Estado | null>;
  findByNome(nome: string): Promise<Estado | null>;
  findBySigla(sigla: string): Promise<Estado | null>;
  create(data: Omit<Estado, 'estado_id'>): Promise<Estado>;
  update(id: number, data: Partial<Omit<Estado, 'estado_id'>>): Promise<Estado | null>;
  delete(id: number): Promise<boolean>;
  findOrCreate(sigla: string, nome: string): Promise<Estado>; // Busca por sigla/nome
}