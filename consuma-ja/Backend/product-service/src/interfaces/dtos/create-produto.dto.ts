import { IsNotEmpty, IsString, IsNumber, IsPositive, IsOptional, Length, MaxLength, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer'; // Para converter tipos

export class CreateProdutoDto {
    @IsNotEmpty({ message: 'Nome do produto é obrigatório.' })
    @IsString()
    @Length(3, 255)
    produto_nome!: string;

    @IsNotEmpty({ message: 'Medida é obrigatória.' })
    @IsString()
    @MaxLength(45)
    produto_medida!: string;

    @IsNotEmpty({ message: 'Preço original é obrigatório.' })
    @IsNumber({}, { message: 'Preço original deve ser um número.' })
    @IsPositive({ message: 'Preço original deve ser positivo.' })
    @Type(() => Number) // Tenta converter string para número
    produto_precoOriginal!: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    descricao?: string;

    @IsNotEmpty({ message: 'ID da Categoria é obrigatório.' })
    @IsInt({ message: 'ID da Categoria deve ser um número inteiro.' })
    @Min(1)
    @Type(() => Number) // Tenta converter string para número
    CATEGORIA_PRODUTO_categoria_id!: number; // Nome da FK

    @IsNotEmpty({ message: 'ID da Marca é obrigatório.' })
    @IsInt({ message: 'ID da Marca deve ser um número inteiro.' })
     @Min(1)
    @Type(() => Number)
    MARCA_PRODUTO_marca_id!: number; // Nome da FK

    @IsNotEmpty({ message: 'ID do Tipo é obrigatório.' })
    @IsInt({ message: 'ID do Tipo deve ser um número inteiro.' })
     @Min(1)
    @Type(() => Number)
    TIPO_PRODUTO_tipo_id!: number; // Nome da FK
}