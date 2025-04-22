import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateEstadoDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do estado é obrigatório.' })
  @MaxLength(45)
  estado_nome: string;

  @IsString()
  @IsNotEmpty({ message: 'A sigla do estado é obrigatória.' })
  @Length(2, 3)
  estado_sigla: string;
}