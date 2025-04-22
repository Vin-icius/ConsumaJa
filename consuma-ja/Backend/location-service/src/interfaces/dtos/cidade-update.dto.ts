import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateCidadeDto {
  @IsOptional()
  @IsString()
  @MaxLength(45, { message: 'O nome da cidade deve ter no máximo 45 caracteres.'})
  cidade_nome?: string;

  @IsOptional()
  @IsString()
  @Length(2, 4, { message: 'O DDD deve ter entre 2 e 4 caracteres.' })
  regiao_ddd?: string;
}