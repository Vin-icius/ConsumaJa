import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Certifique-se de que este caminho está correto

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Para carregar a variável PORT do arquivo .env
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
