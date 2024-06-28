import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { config, PRODUCTS_SERVICE } from '../config';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    ClientsModule.register([
      {
        name: PRODUCTS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: config.productsMicroservice.host,
          port: config.productsMicroservice.port,
        },
      },
    ]),
  ],
})
export class OrdersModule {}
