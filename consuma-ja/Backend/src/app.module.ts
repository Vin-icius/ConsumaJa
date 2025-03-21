import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './Infrastructure/database.module';
import { AuthModule } from './Application/Modules/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Carrega variáveis do .env
    DatabaseModule, // Agora a configuração do banco de dados está em DatabaseModule
    AuthModule, // Agora o AuthModule está disponível globalmente
  ],
})
export class AppModule {}
