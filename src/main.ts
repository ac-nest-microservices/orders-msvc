import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const logger = new Logger('Orders Microservice');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: config.port,
      },
    },
  );

  await app.listen();
  logger.log(`Orders Microservice is running on port ${config.port}`);
}
bootstrap();
