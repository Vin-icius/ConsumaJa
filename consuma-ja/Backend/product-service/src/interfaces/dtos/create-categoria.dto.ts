import { IsNotEmpty, IsString, Length, MaxLength, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoriaDto {
    @IsNotEmpty({ message: 'O nome da categoria não pode ser vazio.' })
    @IsString({ message: 'O nome da categoria deve ser um texto.' })
    @MaxLength(255, { message: 'O nome da categoria deve ter no máximo 255 caracteres.'})
    @Length(3, 255, { message: 'O nome da categoria deve ter pelo menos 3 caracteres.'})
    categoria_nome!: string; // '!' para strictPropertyInitialization

    @IsOptional()
    @IsInt({ message: 'O fornecedor deve ser um número inteiro.' })
    @Min(1, { message: 'O fornecedor deve ser um ID válido.' })
    @Type(() => Number)
    fornecedor_pessoa_id?: number | null;
}