import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateMarcaDto {
    @IsNotEmpty({ message: 'O nome da marca não pode ser vazio.' })
    @IsString({ message: 'O nome da marca deve ser um texto.' })
    @MaxLength(255)
    @Length(2, 255, { message: 'O nome da marca deve ter pelo menos 2 caracteres.'})
    marca_nome!: string;
}