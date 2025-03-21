import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(), // Carrega variáveis do .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          path.join(__dirname, '/../**/*.entity{.ts,.js}'), // Adicionando o path para as entidades
        ],
        synchronize: true, // Para desenvolvimento. Use migrations para produção.
        logging: true, // Habilitar logs de SQL (útil para debugging)
      }),
    }),
  ],
})
export class DatabaseModule {}
