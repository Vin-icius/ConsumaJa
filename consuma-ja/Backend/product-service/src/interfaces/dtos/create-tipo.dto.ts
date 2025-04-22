import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateTipoDto {
    @IsNotEmpty({ message: 'O nome do tipo não pode ser vazio.' })
    @IsString({ message: 'O nome do tipo deve ser um texto.' })
    @MaxLength(255, { message: 'O nome do tipo deve ter no máximo 255 caracteres.'}) 
    @Length(3, 255, { message: 'O nome do tipo deve ter pelo menos 3 caracteres.'})
    tipo_nome!: string; // '!' para strictPropertyInitialization
}