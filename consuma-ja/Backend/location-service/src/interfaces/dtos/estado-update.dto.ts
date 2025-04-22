import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateEstadoDto {
  @IsOptional()
  @IsString()
  @MaxLength(45, { message: 'O nome do estado deve ter no máximo 45 caracteres.'})
  estado_nome?: string;

  @IsOptional()
  @IsString()
  @Length(2, 3, { message: 'A sigla do estado deve ter entre 2 e 3 caracteres.' })
  estado_sigla?: string;
}