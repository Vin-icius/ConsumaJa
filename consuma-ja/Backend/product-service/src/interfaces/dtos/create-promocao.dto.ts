import { IsNotEmpty, IsString, IsDateString, IsOptional, IsInt, Min, ValidateNested, ArrayMinSize, IsArray, Length } from "class-validator";
import { Type } from "class-transformer";
import { CreateItemPromocaoDto } from "./create-item-promocao.dto";

export class CreatePromocaoDto {
    @IsOptional() @IsString() @Length(5, 255)
    promocao_descricao?: string | null;

    @IsNotEmpty({ message: 'Data de início é obrigatória.'})
    @IsDateString({}, { message: 'Data de início deve ser uma data válida (AAAA-MM-DD HH:MM:SS).'})
    inicio!: string; // Recebe como string, converte no serviço ou repo

    @IsOptional()
    @IsDateString({}, { message: 'Data de fim deve ser uma data válida (AAAA-MM-DD HH:MM:SS).'})
    fim?: string | null;

    @IsNotEmpty({ message: 'ID do Fornecedor (Pessoa Jurídica) é obrigatório.'})
    @IsInt() @Min(1) @Type(() => Number)
    JURIDICA_PESSOA_pessoa_id!: number;

    @IsNotEmpty({ message: 'ID do Endereço (Loja) é obrigatório.'})
    @IsInt() @Min(1) @Type(() => Number)
    endereco_id!: number;

    @IsArray()
    @ValidateNested({ each: true }) // Valida cada item do array
    @ArrayMinSize(1, { message: 'Promoção deve ter pelo menos um item.'})
    @Type(() => CreateItemPromocaoDto)
    itens!: CreateItemPromocaoDto[];
}