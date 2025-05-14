import { IsOptional, IsString, IsInt, Min, Max, IsDateString, IsBooleanString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ListarLotesQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt() @Min(1)
    produtoId?: number; // Filtrar lotes de um produto específico

    @IsOptional()
    @IsString() @MaxLength(100)
    loteCodigoQuery?: string; // Buscar por parte do código do lote

    @IsOptional()
    @IsDateString()
    validadeApos?: string; // Lotes com validade APÓS esta data

    @IsOptional()
    @IsDateString()
    validadeAntes?: string; // Lotes com validade ANTES desta data

    @IsOptional()
    @IsBooleanString()
    apenasComEstoque?: string; // "true" ou "false"

    @IsOptional()
    @IsBooleanString()
    ativo?: string; // "true" ou "false" para filtrar por status do lote

    // Paginação
    @IsOptional() @Type(() => Number) @IsInt() @Min(1)
    page?: number;
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
    limit?: number;
}