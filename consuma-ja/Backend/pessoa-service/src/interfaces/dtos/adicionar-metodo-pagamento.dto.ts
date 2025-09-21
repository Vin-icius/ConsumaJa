// src/interfaces/dtos/adicionar-metodo-pagamento.dto.ts
import { IsNotEmpty, IsOptional, IsString, ValidateIf, IsIn } from 'class-validator';

export class AdicionarMetodoPagamentoDto {
    @IsNotEmpty({ message: 'Tipo de pagamento é obrigatório' })
    @IsString({ message: 'Tipo deve ser uma string' })
    @IsIn(['CARTAO', 'CREDITO', 'PIX', 'PAYPAL'], { message: 'Tipo deve ser CARTAO, CREDITO, PIX ou PAYPAL' })
    tipo!: string;

    @ValidateIf(o => ['CARTAO', 'CREDITO'].includes(o.tipo?.toUpperCase()))
    @IsNotEmpty({ message: 'Número do cartão é obrigatório para cartão' })
    @IsString({ message: 'Número do cartão deve ser uma string' })
    numero_cartao?: string;

    @ValidateIf(o => ['CARTAO', 'CREDITO'].includes(o.tipo?.toUpperCase()))
    @IsNotEmpty({ message: 'Nome do titular é obrigatório para cartão' })
    @IsString({ message: 'Nome do titular deve ser uma string' })
    nome_cartao?: string;

    @ValidateIf(o => ['CARTAO', 'CREDITO'].includes(o.tipo?.toUpperCase()))
    @IsNotEmpty({ message: 'Data de validade é obrigatória para cartão' })
    @IsString({ message: 'Data de validade deve ser uma string' })
    data_validade?: string;

    @IsOptional()
    @IsString({ message: 'CVV deve ser uma string' })
    cvv?: string;

    @ValidateIf(o => o.tipo?.toUpperCase() === 'PIX')
    @IsNotEmpty({ message: 'Chave PIX é obrigatória para PIX' })
    @IsString({ message: 'Chave PIX deve ser uma string' })
    chave_pix?: string;

    @ValidateIf(o => o.tipo?.toUpperCase() === 'PAYPAL')
    @IsNotEmpty({ message: 'Email PayPal é obrigatório para PayPal' })
    @IsString({ message: 'Email PayPal deve ser uma string' })
    email_paypal?: string;
}
