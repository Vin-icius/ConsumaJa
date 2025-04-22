import { IsInt, IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateCidadeDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da cidade é obrigatório.'})
  @MaxLength(45)
  cidade_nome: string;

  @IsString()
  @IsNotEmpty({ message: 'O DDD é obrigatório.'})
  @Length(2, 4)
  regiao_ddd: string;

  @IsInt({ message: 'O ID do estado deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O ID do estado é obrigatório.' })
  estado_id: number;
}