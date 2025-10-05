import { IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class RelatorioAvaliacoesQueryDto {
    @IsOptional() @IsInt() @Type(() => Number)
    clienteId?: number;

    @IsOptional() @IsInt() @Type(() => Number)
    nota?: number;

    @IsOptional() @IsDateString()
    dataInicio?: string;

    @IsOptional() @IsDateString()
    dataFim?: string;
    
    @IsOptional() @IsInt() @Type(() => Number)
    promocaoId?: number;

    @IsOptional() @IsInt() @Type(() => Number)
    page?: number;

    @IsOptional() @IsInt() @Type(() => Number)
    limit?: number;
}