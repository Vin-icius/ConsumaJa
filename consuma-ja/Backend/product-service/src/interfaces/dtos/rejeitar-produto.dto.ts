import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejeitarProdutoDto {
    @IsNotEmpty({ message: 'O motivo da rejeição é obrigatório.' })
    @IsString()
    @MaxLength(200, { message: 'Motivo pode ter no máximo 200 caracteres.'})
    motivo!: string;
}