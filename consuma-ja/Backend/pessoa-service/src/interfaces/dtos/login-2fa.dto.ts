// src/interfaces/dtos/login-2fa.dto.ts
import { IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class Login2FADto {
    @IsNotEmpty({ message: 'O campo de login é obrigatório.' })
    @IsString()
    login!: string; // login, CPF ou CNPJ

    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    @IsString()
    @MinLength(3, { message: 'Senha deve ter no mínimo 3 caracteres.'})
    senha!: string;

    @IsOptional()
    @IsString({ message: 'Código 2FA deve ser uma string' })
    @Length(6, 6, { message: 'Código 2FA deve ter exatamente 6 dígitos' })
    codigo_2fa?: string;
}