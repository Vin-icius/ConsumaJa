import { Marca } from './marca.entity';
import { Categoria } from './categoria.entity';
import { Tipo } from './tipo.entity';

export class Produto {
  constructor(
    public id: number,
    public marca: Marca,
    public categoria: Categoria,
    public tipo: Tipo,
    public nome: string,
    public status: 'APROVADO' | 'PENDENTE' | 'REJEITADO',
    public unidadeMedida: string,
    public precoOriginal: number,
    public motivo: string | null,
    public descricao: string | null,
    public dataRegistro: Date,
    public dataAprovacao: Date | null,
    public dataExclusao: Date | null,
    public ativo: boolean
  ) {}
}