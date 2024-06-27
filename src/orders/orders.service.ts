import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

import {
  ChangeOrderStatusDto,
  CreateOrderDto,
  OrderPaginationDto,
} from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  readonly #logger = new Logger(OrdersService.name);

  async onModuleInit() {
    await this.$connect();
    this.#logger.log('Connected to the database');
  }
  create(createOrderDto: CreateOrderDto) {
    return this.order.create({ data: createOrderDto });
  }

  async findAll({ status, page, limit }: OrderPaginationDto) {
    const totalPages = await this.order.count({
      where: { status: status },
    });

    const currentPage = page;
    const itemsPerPage = limit;

    return {
      data: await this.order.findMany({
        take: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
        where: { status: status },
      }),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / itemsPerPage),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: { id },
    });

    if (!order) {
      throw new RpcException({
        message: `Order with ID "${id}" not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return order;
  }

  async changeStatus({ id, status }: ChangeOrderStatusDto) {
    const order = await this.findOne(id);
    if (order.status === status) {
      return order;
    }

    return this.order.update({
      where: { id },
      data: { status },
    });
  }
}
