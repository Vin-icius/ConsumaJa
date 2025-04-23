import { IsOptional, IsString, Length, IsEmail, MinLength, IsInt, IsEnum, IsBoolean } from 'class-validator';
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
}