import { IsOptional, IsString, IsInt, Min, MaxLength, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListarProdutosSelecaoQueryDto {
  @IsOptional() @IsString({ message: 'Termo de busca deve ser texto.' }) @MaxLength(100)
  nomeQuery?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  categoriaId?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  marcaId?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  tipoId?: number;

  // Se os produtos são filtrados por fornecedor na busca inicial para promoção:
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  fornecedorId?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit?: number;
}