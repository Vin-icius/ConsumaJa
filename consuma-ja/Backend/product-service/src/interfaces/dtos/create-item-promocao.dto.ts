import { IsInt, IsNotEmpty, IsNumber, IsPositive, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateItemPromocaoDto {
    @IsNotEmpty({ message: 'ID do Lote do Produto é obrigatório.'})
    @IsInt({ message: 'ID do Lote deve ser um número inteiro.'})
    @Min(1)
    @Type(() => Number)
    LOTEPROD_lote_id!: number; // Referencia o lote específico

    @IsNotEmpty({ message: 'Quantidade do item na promoção é obrigatória.'})
    @IsInt({ message: 'Quantidade deve ser um número inteiro.'})
    @IsPositive({ message: 'Quantidade deve ser positiva.'})
    @Type(() => Number)
    itemPromocao_qtde!: number;

    @IsNotEmpty({ message: 'Valor promocional do item é obrigatório.'})
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor promocional deve ser um número com até 2 casas decimais.'})
    @IsPositive({ message: 'Valor promocional deve ser positivo.'})
    @Type(() => Number)
    itemPromocao_valor!: number;
}