import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { CreatePessoaBaseDto } from './create-pessoa-base.dto';
import { IsCpf } from '../../common/validators/is-cpf.validator'; // Ajuste o caminho conforme a localização do seu arquivo

export class CreateFisicaDto extends CreatePessoaBaseDto {
  // CPF é obrigatório APENAS se o tipo for Fisica
  @ValidateIf(o => o.pessoa_tipo === 'Fisica') // Só valida se for Fisica
  @IsNotEmpty({ message: 'CPF é obrigatório para Pessoa Física.' })
  @IsString()
  @IsCpf({ message: 'O CPF informado é inválido.' }) // Usando o novo validador customizado
  pessoa_cpf!: string;
}
