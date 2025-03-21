import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../Services/auth.service';
import { PessoaRepository } from '../../Domain/Repositories/pessoa.repository';
import { JwtStrategy } from '../../Middleware/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService, PessoaRepository, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
