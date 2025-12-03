import { IsUUID } from 'class-validator';

export class SessaoDto {
  @IsUUID('4', { message: 'sessao_id deve ser um UUID válido.' })
  sessao_id!: string;
}
