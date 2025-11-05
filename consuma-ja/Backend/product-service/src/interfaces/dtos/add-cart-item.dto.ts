import { IsInt, Min } from "class-validator"
import { Type } from "class-transformer"

export class AddCartItemRequestDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pessoa_id!: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  produto_id!: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  promocao_id!: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  lote_id!: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantidade!: number
}
