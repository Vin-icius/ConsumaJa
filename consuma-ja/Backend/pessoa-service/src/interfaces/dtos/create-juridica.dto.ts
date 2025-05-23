import { IsNotEmpty, IsString, ValidateIf, IsOptional, IsInt, Min } from 'class-validator';
import { CreatePessoaBaseDto } from './create-pessoa-base.dto';
import { IsCnpj } from '../../common/validators/is-cnpj.validator'; // Ajuste o caminho conforme a localização do seu arquivo

export class CreateJuridicaDto extends CreatePessoaBaseDto {
  @ValidateIf(o => o.pessoa_tipo === 'Juridica')
  @IsNotEmpty({ message: 'CNPJ é obrigatório para Pessoa Jurídica.' })
  @IsString()
  @IsCnpj({ message: 'O CNPJ informado é inválido.' }) // Usando o novo validador customizado
  cnpj!: string;

  @IsOptional()
  @IsInt() @Min(1)
  fornecedor_num?: number | null;
}
