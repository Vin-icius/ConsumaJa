import { IsOptional, IsString, Length, IsEmail, MinLength, IsInt, IsEnum, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PessoaStatus } from '../../domain/entities/pessoa.entity';

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

    // Dados de endereço (opcionais)
    @IsOptional() @IsString() @Length(8, 10)
    endereco_cep?: string;

    @IsOptional() @IsString() @Length(1, 60)
    endereco_rua?: string;

    @IsOptional() @IsString() @Length(1, 10)
    endereco_numero?: string;

    @IsOptional() @IsString() @Length(0, 80)
    endereco_complemento?: string | null;

    @IsOptional() @IsString() @Length(1, 45)
    endereco_bairro?: string;

    @IsOptional() @IsInt()
    @Type(() => Number)
    cidade_id?: number;
}