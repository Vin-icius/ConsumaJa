import { IsNotEmpty, IsInt, Min, Max, IsArray, ValidateNested, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

class RespostaDto {
    @IsNotEmpty() @IsInt()
    pergunta_id!: number;

    @IsNotEmpty() @IsInt() @Min(1) @Max(5)
    nota!: number;
}

export class CreateAvaliacaoDto {
    @IsNotEmpty({ message: 'ID da Venda é obrigatório.' }) @IsInt()
    @Type(() => Number)
    venda_id!: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RespostaDto)
    respostas!: RespostaDto[];

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    descricao?: string;
}