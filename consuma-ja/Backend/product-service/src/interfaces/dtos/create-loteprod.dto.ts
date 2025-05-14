import { IsNotEmpty, IsString, IsInt, Min, IsDateString, MaxLength, IsPositive, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoteProdDto {
    @IsNotEmpty({ message: 'ID do Produto é obrigatório.' })
    @IsInt({ message: 'ID do Produto deve ser um número inteiro.' })
    @Min(1)
    @Type(() => Number)
    produto_id!: number;

    @IsNotEmpty({ message: 'Código do lote é obrigatório.' })
    @IsString()
    @MaxLength(100, { message: 'Código do lote deve ter no máximo 100 caracteres.' })
    lote_codigo!: string;

    @IsNotEmpty({ message: 'Data de validade é obrigatória.' })
    @IsDateString({}, { message: 'Data de validade deve estar no formato AAAA-MM-DD.' })
    // Validar se a data é no futuro pode ser feito no serviço
    lote_validade!: string; // Recebe como string AAAA-MM-DD

    @IsNotEmpty({ message: 'Quantidade inicial é obrigatória.' })
    @IsInt({ message: 'Quantidade inicial deve ser um número inteiro.' })
    @IsPositive({ message: 'Quantidade inicial deve ser positiva.' })
    @Type(() => Number)
    lote_quantidade_inicial!: number;

    @IsOptional() // Quantidade atual pode ser igual à inicial na criação
    @IsInt({ message: 'Quantidade atual deve ser um número inteiro.' })
    @Min(0, { message: 'Quantidade atual não pode ser negativa.' }) // Pode ser 0
    @Type(() => Number)
    lote_quantidade_atual?: number; // Se não fornecido, serviço pode igualar à inicial
}