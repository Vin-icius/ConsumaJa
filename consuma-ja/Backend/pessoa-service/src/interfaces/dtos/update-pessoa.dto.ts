import { IsOptional, IsString, Length, IsEmail, MinLength, IsInt, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PessoaStatus } from '../../domain/entities/pessoa.entity';

export class UpdateEnderecoDto {
    @IsString()
    @Length(8, 9, { message: 'CEP deve ter 8 dígitos.' })
    endereco_cep!: string;

    @IsString()
    @Length(3, 60)
    endereco_rua!: string;

    @IsString()
    @Length(1, 10)
    endereco_numero!: string;

    @IsString()
    @Length(3, 60)
    endereco_bairro!: string;

    @IsOptional()
    @IsString()
    @Length(0, 80)
    endereco_complemento?: string | null;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Cidade deve ser identificada por um número inteiro.' })
    cidade_id?: number | null;
}

export class UpdatePessoaDto {
    @IsOptional() @IsString() @Length(3, 255)
    pessoa_nome?: string;

    @IsOptional() @IsEmail({}, { message: 'Email inválido.'})
    pessoa_email?: string;

    @IsOptional() @IsString() @Length(10, 20)
    pessoa_telefone?: string | null;

    @IsOptional() @IsString() @MinLength(3)
    pessoa_senha?: string; // Nova senha (sem hash)

    @IsOptional() @IsInt() @IsEnum([0, 1], { message: 'Status deve ser 0 (inativo) ou 1 (ativo).'})
    @Type(() => Number)
    pessoa_status?: PessoaStatus; // 0 ou 1

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateEnderecoDto)
    endereco?: UpdateEnderecoDto;
}