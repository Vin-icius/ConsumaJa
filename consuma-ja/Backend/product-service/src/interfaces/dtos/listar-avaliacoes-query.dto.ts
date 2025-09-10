import { IsOptional, IsNumberString } from 'class-validator';

export class ListarAvaliacoesQueryDto {
    @IsOptional()
    @IsNumberString({}, { message: 'A página deve ser um número.'})
    page?: number;

    @IsOptional()
    @IsNumberString({}, { message: 'O limite deve ser um número.'})
    limit?: number;
}