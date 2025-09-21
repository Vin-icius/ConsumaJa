// src/interfaces/dtos/configurar-2fa.dto.ts
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class Configurar2FADto {
    @IsNotEmpty({ message: 'Campo habilitado é obrigatório' })
    @IsBoolean({ message: 'Campo habilitado deve ser um booleano' })
    habilitado!: boolean;
}