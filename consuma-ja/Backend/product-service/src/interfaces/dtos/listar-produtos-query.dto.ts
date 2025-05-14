import {
    IsOptional,
    IsString,
    IsInt,
    Min,
    MaxLength,
    Max,
    IsEnum,
    IsBooleanString, 
  } from 'class-validator';
  import { Type } from 'class-transformer'; 
  import { Produto } from '../../domain/entities/produto.entity';

  type ProdutoStatus = Produto['produto_status']; // 'APROVADO' | 'PENDENTE' | 'REJEITADO'
  
  export class ListarProdutosQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'ID do Produto deve ser um número inteiro.' })
    @Min(1, { message: 'ID do Produto deve ser maior que zero.' })
    produto_id?: number;
  
    @IsOptional()
    @IsString({ message: 'O termo de busca por nome deve ser um texto.' })
    @MaxLength(255, { message: 'O nome do produto deve ter no máximo 255 caracteres.'})
    nomeQuery?: string;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'ID da Marca deve ser um número inteiro.' })
    @Min(1, { message: 'ID da Marca deve ser maior que zero.' })
    marcaId?: number; // Corresponde a MARCA_PRODUTO_marca_id
  
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'ID do Tipo deve ser um número inteiro.' })
    @Min(1, { message: 'ID do Tipo deve ser maior que zero.' })
    tipoId?: number; // Corresponde a TIPO_PRODUTO_tipo_id
  
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'ID da Categoria deve ser um número inteiro.' })
    @Min(1, { message: 'ID da Categoria deve ser maior que zero.' })
    categoriaId?: number; // Corresponde a CATEGORIA_PRODUTO_categoria_id
  
    @IsOptional()
    @IsEnum(['APROVADO', 'PENDENTE', 'REJEITADO'], {
      message: "Status do produto deve ser 'APROVADO', 'PENDENTE' ou 'REJEITADO'.",
    })
    produto_status?: ProdutoStatus; 
  
    @IsOptional()
    // Query params são strings, então validamos como "true" ou "false"
    @IsBooleanString({ message: 'O filtro "ativo" deve ser "true" ou "false".' })
    ativo?: string;
    // O serviço converterá esta string "true"/"false" para um booleano antes de passar para o repositório.
  
    // Para paginação
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Página deve ser um número inteiro.' })
    @Min(1, { message: 'Página deve ser no mínimo 1.' })
    page?: number;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limite deve ser um número inteiro.' })
    @Min(1, { message: 'Limite deve ser no mínimo 1.' })
    @Max(100, { message: 'Limite não pode exceder 100.' })
    limit?: number;
  }