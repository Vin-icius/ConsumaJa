import { IsOptional, IsString, IsIn, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class ListarPromocoesQueryDto {
    @IsOptional() @IsString()
    searchTerm?: string;

    @IsOptional() @IsIn(['produto', 'fornecedor'], { message: "Tipo de busca deve ser 'produto' ou 'fornecedor'."})
    searchType?: 'produto' | 'fornecedor';

    @IsOptional()
    @IsInt() @Min(1) @Type(() => Number)
    categoriaId?: number;

    @IsOptional() @IsIn(['ATIVA', 'INATIVA', 'EXPIRADA'], { message: "Status inválido."}) // Exemplo
    status?: string; // O serviço vai traduzir para 'ativo' = true/false e checar datas

    // Adicionar paginação se necessário
    // @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
    // @IsOptional() @IsInt() @Min(1) @Type(() => Number) limit?: number;
}