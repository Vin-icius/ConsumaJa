import { IsInt, Min } from "class-validator"
import { Type } from "class-transformer"

export class UpdateCartItemQuantityRequestDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pessoa_id!: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  cart_item_id!: number

  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantidade!: number
}
