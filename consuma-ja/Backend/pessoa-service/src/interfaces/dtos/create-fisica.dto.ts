import { IsNotEmpty, IsString, Length, ValidateIf } from 'class-validator';
import { CreatePessoaBaseDto } from './create-pessoa-base.dto';

export class CreateFisicaDto extends CreatePessoaBaseDto {
    // CPF é obrigatório APENAS se o tipo for Fisica
    @ValidateIf(o => o.pessoa_tipo === 'Fisica') // Só valida se for Fisica
    @IsNotEmpty({ message: 'CPF é obrigatório para Pessoa Física.'})
    @IsString()
    @Length(11, 14, { message: 'CPF inválido (use 11 ou 14 caracteres com/sem formatação).'}) // Validar formato com regex seria melhor
    pessoa_cpf!: string;
}