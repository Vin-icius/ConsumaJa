import { IsNotEmpty, IsString, Length, ValidateIf, IsOptional, IsInt, Min } from 'class-validator';
import { CreatePessoaBaseDto } from './create-pessoa-base.dto';

export class CreateJuridicaDto extends CreatePessoaBaseDto {
    @ValidateIf(o => o.pessoa_tipo === 'Juridica')
    @IsNotEmpty({ message: 'CNPJ é obrigatório para Pessoa Jurídica.'})
    @IsString()
    @Length(14, 18, { message: 'CNPJ inválido (use 14 ou 18 caracteres com/sem formatação).'})
    cnpj!: string;

    @IsOptional()
    @IsInt() @Min(1)
    fornecedor_num?: number | null;
}