import { IsNotEmpty, IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvaliacaoDto {
    @IsNotEmpty({ message: 'ID do Produto é obrigatório.' })
    @IsInt({ message: 'ID do Produto deve ser um número inteiro.' })
    @Type(() => Number)
    produto_id!: number; // <- Correção aqui

    // Em uma implementação real, o serviço de pedidos validaria isso.
    // Incluímos aqui para a simulação no serviço de avaliação.
    @IsNotEmpty({ message: 'ID do Pedido é obrigatório.' })
    @IsInt({ message: 'ID do Pedido deve ser um número inteiro.' })
    @Type(() => Number)
    pedido_id!: number; // <- Correção aqui

    @IsNotEmpty({ message: 'A nota é obrigatória.' })
    @IsInt({ message: 'A nota deve ser um número inteiro.' })
    @Min(1, { message: 'A nota mínima é 1.'})
    @Max(5, { message: 'A nota máxima é 5.'})
    @Type(() => Number)
    nota!: number; // <- Correção aqui

    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'O comentário pode ter no máximo 1000 caracteres.' })
    comentario?: string; // Propriedades opcionais (?) não precisam do '!'
}