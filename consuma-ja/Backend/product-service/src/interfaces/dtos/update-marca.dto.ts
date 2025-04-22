import { IsOptional, IsString, Length, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateMarcaDto {
    @IsOptional()
    @IsNotEmpty({ message: 'O nome da marca não pode ser vazio se fornecido.' })
    @IsString({ message: 'O nome da marca deve ser um texto.' })
    @MaxLength(255)
    @Length(2, 255)
    marca_nome?: string;
}