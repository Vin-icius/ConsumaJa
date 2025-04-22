import { IsOptional, IsString, IsNumber, IsPositive, Length, MaxLength, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProdutoDto {
    @IsOptional() @IsNotEmpty() @IsString() @Length(3, 255)
    produto_nome?: string;

    @IsOptional() @IsNotEmpty() @IsString() @MaxLength(45)
    produto_medida?: string;

    @IsOptional() @IsNotEmpty()
    @IsNumber({}, { message: 'Preço original deve ser um número.' })
    @IsPositive({ message: 'Preço original deve ser positivo.' })
    @Type(() => Number)
    produto_precoOriginal?: number;

    @IsOptional() @IsString() @MaxLength(500)
    descricao?: string | null; // Permitir null para limpar

    @IsOptional() @IsNotEmpty() @IsInt() @Min(1) @Type(() => Number)
    CATEGORIA_PRODUTO_categoria_id?: number;

    @IsOptional() @IsNotEmpty() @IsInt() @Min(1) @Type(() => Number)
    MARCA_PRODUTO_marca_id?: number;

    @IsOptional() @IsNotEmpty() @IsInt() @Min(1) @Type(() => Number)
    TIPO_PRODUTO_tipo_id?: number;
}