import { IsOptional, IsString, Length, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEnderecoDto {
    @IsOptional() @IsString() @Length(8, 10)
    endereco_cep?: string;

    @IsOptional() @IsString() @Length(1, 60)
    endereco_rua?: string;

    @IsOptional() @IsString() @Length(1, 10)
    endereco_numero?: string;

    @IsOptional() @IsString() @Length(0, 80)
    endereco_complemento?: string | null;

    @IsOptional() @IsString() @Length(1, 45)
    endereco_bairro?: string;

    @IsOptional() @IsInt()
    @Type(() => Number)
    cidade_id?: number;
}