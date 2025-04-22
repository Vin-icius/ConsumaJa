import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
    @IsNotEmpty({ message: 'O nome da categoria não pode ser vazio.' })
    @IsString({ message: 'O nome da categoria deve ser um texto.' })
    @MaxLength(255, { message: 'O nome da categoria deve ter no máximo 255 caracteres.'})
    @Length(3, 255, { message: 'O nome da categoria deve ter pelo menos 3 caracteres.'})
    categoria_nome!: string; // '!' para strictPropertyInitialization
}