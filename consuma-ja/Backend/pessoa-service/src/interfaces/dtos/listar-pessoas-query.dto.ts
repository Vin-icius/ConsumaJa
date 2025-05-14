import { IsOptional, IsString, IsIn, IsInt, Min, Max, IsBooleanString, MaxLength, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PessoaTipo, PessoaStatus } from '../../domain/entities/pessoa.entity'; // Importe os tipos

export class ListarPessoasQueryDto {
  @IsOptional()
  @IsString({ message: 'O termo de busca por nome deve ser um texto.' })
  @MaxLength(100)
  nomeQuery?: string;

  @IsOptional()
  @IsEnum(['Fisica', 'Juridica', 'Admin'], { message: 'Tipo de pessoa inválido.' })
  pessoa_tipo?: PessoaTipo;

  @IsOptional()
  @Type(() => Number) // Transforma string '0'/'1' em número
  @IsInt({ message: 'Status deve ser 0 ou 1.' })
  @IsIn([0, 1], { message: 'Status deve ser 0 (inativo) ou 1 (ativo).'})
  pessoa_status?: PessoaStatus; // 0 ou 1

  // Para paginação
  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(1) @Max(50) // Limite máximo de 50 por página
  limit?: number;
}