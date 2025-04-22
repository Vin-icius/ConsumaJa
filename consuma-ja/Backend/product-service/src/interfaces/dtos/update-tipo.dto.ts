import { IsOptional, IsString, Length, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateTipoDto {
    @IsOptional()
    @IsNotEmpty({ message: 'O nome do tipo não pode ser vazio se fornecido.' })
    @IsString({ message: 'O nome do tipo deve ser um texto.' })
    @MaxLength(255)
    @Length(3, 255)
    tipo_nome?: string; // Opcional
}