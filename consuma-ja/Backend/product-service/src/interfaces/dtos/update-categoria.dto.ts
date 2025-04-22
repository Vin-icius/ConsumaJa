import { IsOptional, IsString, Length, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateCategoriaDto {
    @IsOptional()
    @IsNotEmpty({ message: 'O nome da categoria não pode ser vazio se fornecido.' }) // Garante que não seja string vazia se passado
    @IsString({ message: 'O nome da categoria deve ser um texto.' })
    @MaxLength(255)
    @Length(3, 255)
    categoria_nome?: string; // Propriedade opcional '?' não precisa do '!'
}