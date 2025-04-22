import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: 'O campo de login é obrigatório.' })
    @IsString()
    login!: string; // login, CPF ou CNPJ

    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    @IsString()
    @MinLength(3, { message: 'Senha deve ter no mínimo 3 caracteres.'})
    senha!: string;
}