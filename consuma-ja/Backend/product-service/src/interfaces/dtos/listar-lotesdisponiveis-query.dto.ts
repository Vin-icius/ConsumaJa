import { IsOptional, IsString, IsBooleanString, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ListarLotesDisponiveisQueryDto {

    @IsNotEmpty({ message: 'ID do Produto é obrigatório.'})
        @IsInt() @Min(1) @Type(() => Number)
        produtoId!: number;

    @IsNotEmpty({ message: 'ID do Fornecedor (Pessoa Jurídica) é obrigatório.'})
        @IsInt() @Min(1) @Type(() => Number)
        fornecedorId!: number;

    @IsOptional() @IsString()
    produtoNomeQuery?: string;

    // Exemplo de como receber booleanos da query string
    @IsOptional() @IsBooleanString()
    apenasComEstoque?: string; // Vem como string 'true'/'false'

    @IsOptional() @IsBooleanString()
    apenasNaoVencidos?: string;

    // Adicionar paginação aqui se desejar
}