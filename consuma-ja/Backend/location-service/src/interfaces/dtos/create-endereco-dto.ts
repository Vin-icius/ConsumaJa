import { IsNotEmpty, IsString, Length, MaxLength, IsOptional, IsInt, Min, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class CreateEnderecoDto {
    @IsNotEmpty({ message: 'Rua é obrigatória.' })
    @IsString() @MaxLength(60)
    rua!: string;

    @IsNotEmpty({ message: 'Bairro é obrigatório.' })
    @IsString() @MaxLength(45)
    bairro!: string;

    @IsNotEmpty({ message: 'Número é obrigatório.' })
    @IsString() @MaxLength(10)
    numero!: string;

    @IsNotEmpty({ message: 'CEP é obrigatório.' })
    @IsString() @Length(8, 10, { message: 'CEP deve ter 8 dígitos (sem formatação) ou 9-10 (com formatação).'}) // Ajuste conforme o formato que você armazena
    cep!: string;

    @IsOptional()
    @IsString() @MaxLength(80)
    complemento?: string | null;

    @IsNotEmpty({ message: 'ID da Cidade é obrigatório.' })
    @IsInt() @Min(1)
    CIDADE_cidade_id!: number;

    @IsNotEmpty({ message: 'ID da Pessoa é obrigatório.' })
    @IsInt() @Min(1)
    PESSOA_pessoa_id!: number; // ID da Pessoa a quem este endereço pertence
}