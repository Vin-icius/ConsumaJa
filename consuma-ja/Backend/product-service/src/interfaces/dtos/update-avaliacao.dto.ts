import { IsOptional, IsInt, Min, Max, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAvaliacaoDto {
    @IsOptional()
    @IsInt({ message: 'A nota deve ser um número inteiro.' })
    @Min(1, { message: 'A nota mínima é 1.'})
    @Max(5, { message: 'A nota máxima é 5.'})
    @Type(() => Number)
    nota?: number;

    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'O comentário pode ter no máximo 1000 caracteres.' })
    comentario?: string;
}