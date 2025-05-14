import { IsOptional, IsString, IsInt, Min, IsDateString, MaxLength, IsPositive, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLoteProdDto {
    // produto_id e lote_codigo geralmente não são alterados após a criação do lote
    // Se precisar alterar, considere uma lógica mais complexa ou recriação.

    @IsOptional()
    @IsDateString({}, { message: 'Data de validade deve estar no formato AAAA-MM-DD.' })
    lote_validade?: string;

    @IsOptional()
    @IsInt({ message: 'Quantidade inicial deve ser um número inteiro.' })
    @IsPositive({ message: 'Quantidade inicial deve ser positiva.' })
    @Type(() => Number)
    lote_quantidade_inicial?: number;

    @IsOptional()
    @IsInt({ message: 'Quantidade atual deve ser um número inteiro.' })
    @Min(0, { message: 'Quantidade atual não pode ser negativa.' })
    @Type(() => Number)
    lote_quantidade_atual?: number;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean) // Para transformar 'true'/'false' de query/body
    ativo?: boolean;
}