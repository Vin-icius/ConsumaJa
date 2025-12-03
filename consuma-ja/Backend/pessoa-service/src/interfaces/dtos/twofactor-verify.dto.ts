import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TwoFactorVerifyDto {
  @IsString()
  @IsNotEmpty({ message: 'Token de verificação é obrigatório.' })
  token!: string;

  @IsString()
  @Length(6, 6, { message: 'Código 2FA deve possuir exatamente 6 dígitos.' })
  codigo_2fa!: string;
}
