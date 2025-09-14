import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemVendaDto {
  @IsNumber() @Min(1) @Type(() => Number)
  lote_id!: number;

  @IsNumber() @Min(1) @Type(() => Number)
  quantidade!: number;

  @IsNumber() @Min(0.01) @Type(() => Number)
  valor_unitario!: number;

  @IsNumber() @Min(1) @Type(() => Number)
  promocao_id!: number;
}

export class CreateVendaDto {
  @IsOptional() @IsString()
  data_venda?: string;

  @IsArray() @ValidateNested({ each: true }) @Type(() => ItemVendaDto)
  itens!: ItemVendaDto[];

  @IsOptional() @IsNumber() @Min(1) @Type(() => Number)
  quantidade_total_itens?: number;

  @IsOptional() @IsNumber() @Min(0.01) @Type(() => Number)
  valor_total?: number;

  // Adicionar campos obrigatórios que podem vir do auth ou payload
  @IsNumber() @Min(1) @Type(() => Number)
  pessoa_id!: number;

  @IsNumber() @Min(1) @Type(() => Number)
  endereco_id!: number;
}