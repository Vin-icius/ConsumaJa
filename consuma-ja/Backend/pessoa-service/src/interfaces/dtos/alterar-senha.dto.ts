// src/interfaces/dtos/alterar-senha.dto.ts
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class AlterarSenhaDto {
    @IsNotEmpty({ message: 'A senha atual é obrigatória' })
    @IsString()
    senha_atual!: string;

    @IsNotEmpty({ message: 'A nova senha é obrigatória' })
    @IsString()
    @MinLength(8, { message: 'A nova senha deve ter pelo menos 8 caracteres' })
    @MaxLength(50, { message: 'A nova senha deve ter no máximo 50 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'A nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    })
    nova_senha!: string;

    @IsNotEmpty({ message: 'A confirmação da senha é obrigatória' })
    @IsString()
    confirmar_senha!: string;
}
