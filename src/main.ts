import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const logger = new Logger('Orders Microservice');

  const app = await NestFactory.create(AppModule);
  await app.listen(config.port);
  logger.log(`Orders Microservice is running on port ${config.port}`);
}
bootstrap();
