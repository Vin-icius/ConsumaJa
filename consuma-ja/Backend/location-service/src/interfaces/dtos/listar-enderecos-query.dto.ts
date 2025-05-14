import { IsOptional, IsInt, Min, Max, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer'; // <<< GARANTA ESTE IMPORT

export class ListarEnderecosQueryDto {
    @IsOptional()
    @Type(() => Number) // <<< GARANTA ESTE DECORATOR ANTES DE @IsInt
    @IsInt({ message: 'ID da Pessoa deve ser um número inteiro.' })
    @Min(1, { message: 'ID da Pessoa deve ser maior que zero.' })
    pessoaId?: number;

    @IsOptional()
    @IsBooleanString({ message: 'O filtro "ativo" deve ser "true" ou "false".' })
    ativo?: string;

    @IsOptional()
    @Type(() => Number) // <<< PARA PAGE
    @IsInt({ message: 'Página deve ser um número inteiro.' })
    @Min(1, { message: 'Página deve ser no mínimo 1.' })
    page?: number;

    @IsOptional()
    @Type(() => Number) // <<< PARA LIMIT
    @IsInt({ message: 'Limite deve ser um número inteiro.' })
    @Min(1, { message: 'Limite deve ser no mínimo 1.' })
    @Max(100, { message: 'Limite não pode exceder 100.' }) // Ajuste o máximo se necessário
    limit?: number;
}