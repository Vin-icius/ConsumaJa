import { IsOptional, IsNumberString, IsDateString, IsString, Length } from 'class-validator';

export class ListarAvaliacoesQueryDto {
    @IsOptional()
    @IsNumberString({}, { message: 'A página deve ser um número.'})
    page?: string;

    @IsOptional()
    @IsNumberString({}, { message: 'O limite deve ser um número.'})
    limit?: string;

    @IsOptional()
    @IsDateString({}, { message: 'A data inicial deve estar no formato ISO (YYYY-MM-DD).' })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'A data final deve estar no formato ISO (YYYY-MM-DD).' })
    endDate?: string;

    @IsOptional()
    @IsNumberString({}, { message: 'A nota mínima deve ser numérica.' })
    notaMin?: string;

    @IsOptional()
    @IsNumberString({}, { message: 'A nota máxima deve ser numérica.' })
    notaMax?: string;

    @IsOptional()
    @IsNumberString({}, { message: 'O identificador do fornecedor deve ser numérico.' })
    fornecedorId?: string;

    @IsOptional()
    @IsNumberString({}, { message: 'O identificador do cliente deve ser numérico.' })
    clienteId?: string;

    @IsOptional()
    @IsString({ message: 'O nome do fornecedor deve ser um texto.' })
    @Length(0, 80, { message: 'O nome do fornecedor deve ter no máximo 80 caracteres.' })
    fornecedorNome?: string;

    @IsOptional()
    @IsString({ message: 'O nome do cliente deve ser um texto.' })
    @Length(0, 80, { message: 'O nome do cliente deve ter no máximo 80 caracteres.' })
    clienteNome?: string;

    @IsOptional()
    @IsString({ message: 'O termo de busca deve ser um texto.' })
    @Length(0, 80, { message: 'O termo de busca deve ter no máximo 80 caracteres.' })
    search?: string;
}