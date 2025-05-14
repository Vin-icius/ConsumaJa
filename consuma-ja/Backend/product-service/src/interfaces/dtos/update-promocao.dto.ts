import { IsOptional, IsString, IsDateString, IsInt, Min, ValidateNested, IsArray, ArrayMinSize, Length } from "class-validator";
import { Type } from "class-transformer";
import { CreateItemPromocaoDto } from "./create-item-promocao.dto"; // Pode reusar ou criar UpdateItemDto

export class UpdatePromocaoDto {
    @IsOptional() @IsString() @Length(5, 255)
    promocao_descricao?: string | null;

    @IsOptional() @IsDateString()
    inicio?: string;

    @IsOptional() @IsDateString()
    fim?: string | null;

    // Geralmente não se altera o fornecedor ou endereço de uma promoção existente
    // @IsOptional() @IsInt() @Min(1) @Type(() => Number)
    // JURIDICA_PESSOA_pessoa_id?: number;
    // @IsOptional() @IsInt() @Min(1) @Type(() => Number)
    // endereco_id?: number;

    // Atualizar itens pode ser complexo (ex: remover alguns, adicionar novos, atualizar existentes)
    // Para simplificar, pode-se exigir que todos os itens sejam reenviados ou ter endpoints separados para gerenciar itens.
    // Aqui, vamos permitir reenviar a lista de itens (sobrescreve os antigos)
    @IsOptional() @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1) @Type(() => CreateItemPromocaoDto)
    itens?: CreateItemPromocaoDto[];
}