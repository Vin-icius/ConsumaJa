import { IsOptional, IsString, Length, MaxLength, IsInt, Min, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class UpdateEnderecoDto {
    @IsOptional() @IsString() @MaxLength(60)
    rua?: string;

    @IsOptional() @IsString() @MaxLength(45)
    bairro?: string;

    @IsOptional() @IsString() @MaxLength(10)
    numero?: string;

    @IsOptional() @IsString() @Length(8, 10)
    cep?: string;

    @IsOptional() @IsString() @MaxLength(80)
    complemento?: string | null;

    @IsOptional() @IsInt() @Min(1)
    CIDADE_cidade_id?: number;

    // PESSOA_pessoa_id geralmente não é alterado em um update de endereço.
    // Se precisar mudar o "dono" do endereço, seria uma operação mais complexa ou nova atribuição.

    @IsOptional()
    @IsBoolean() // Tentar converter 'true'/'false' string para boolean
    ativo?: boolean;
}