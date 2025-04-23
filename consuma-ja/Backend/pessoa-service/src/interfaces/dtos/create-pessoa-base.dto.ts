// src/interfaces/dtos/create-pessoa-base.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches, MinLength, IsNumber, IsInt, IsEnum, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PessoaTipo } from '../../domain/entities/pessoa.entity'; // Importar tipo

export class CreatePessoaBaseDto {
    @IsNotEmpty({ message: 'Nome é obrigatório.' }) @IsString() @Length(3, 255)
    pessoa_nome!: string;

    @IsNotEmpty({ message: 'Email é obrigatório.' }) @IsEmail({}, { message: 'Email inválido.'})
    pessoa_email!: string;

    @IsOptional() @IsString() @Length(10, 20)
    pessoa_telefone?: string | null;

    // <<< REMOVIDO IsNotEmpty e Length daqui >>>
    @IsOptional() // Login é opcional aqui, será derivado ou exigido pelo DTO específico (Admin)
    @IsString()
    @MaxLength(100) // Manter MaxLength
    pessoa_login?: string; // <<< Torna opcional no DTO base >>>
    // -----------------------------------------

    @IsNotEmpty({ message: 'Senha é obrigatória.' }) @IsString() @MinLength(3, { message: 'Senha deve ter no mínimo 3 caracteres.'})
    pessoa_senha!: string;

    @IsNotEmpty({ message: 'Tipo de pessoa é obrigatório.'}) @IsEnum(['Fisica', 'Juridica', 'Admin'], { message: 'Tipo de pessoa inválido.'})
    pessoa_tipo!: PessoaTipo; // Tipo ainda é obrigatório

    // Campos de Endereço mantidos como obrigatórios
    @IsNotEmpty({ message: 'CEP é obrigatório.' }) @IsString() @Length(8, 10)
    cep!: string;
    @IsNotEmpty({ message: 'Rua é obrigatória.' }) @IsString() @MaxLength(60)
    rua!: string;
    @IsNotEmpty({ message: 'Bairro é obrigatório.' }) @IsString() @MaxLength(45)
    bairro!: string;
    @IsNotEmpty({ message: 'Número é obrigatório.' }) @IsString() @MaxLength(10)
    numero!: string;
    @IsOptional() @IsString() @MaxLength(80)
    complemento?: string | null;
    @IsNotEmpty({ message: 'ID da Cidade é obrigatório.'})
    @IsInt({ message: 'ID da Cidade deve ser número.' }) @Type(() => Number)
    CIDADE_cidade_id!: number;
}