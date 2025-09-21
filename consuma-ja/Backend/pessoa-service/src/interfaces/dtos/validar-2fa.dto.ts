// src/interfaces/dtos/validar-2fa.dto.ts
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class Validar2FADto {
    @IsNotEmpty({ message: 'Código 2FA é obrigatório' })
    @IsString({ message: 'Código 2FA deve ser uma string' })
    @Length(6, 6, { message: 'Código 2FA deve ter exatamente 6 dígitos' })
    codigo_2fa!: string;
}