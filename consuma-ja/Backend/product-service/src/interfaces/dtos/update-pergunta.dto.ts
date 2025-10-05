import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePerguntaDto {
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'A descrição pode ter no máximo 500 caracteres.' })
    perguntas_descricao?: string;

    @IsOptional()
    @IsBoolean({ message: 'O campo "ativo" deve ser um booleano.' })
    @Type(() => Boolean)
    ativo?: boolean;
}