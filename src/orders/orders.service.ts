import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

import {
  ChangeOrderStatusDto,
  CreateOrderDto,
  OrderPaginationDto,
  ProductDto,
} from './dto';
import { PRODUCTS_SERVICE } from '../config';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  readonly #logger = new Logger(OrdersService.name);

  constructor(@Inject(PRODUCTS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.#logger.log('Connected to the database');
  }

  async create({ items: orderItems }: CreateOrderDto) {
    try {
      const productsIds = orderItems.map((item) => item.productId);
      const products: ProductDto[] = await firstValueFrom(
        this.client.send('validateProducts', productsIds),
      );

      const totalAmount = orderItems.reduce((acc, { quantity, productId }) => {
        const price = products.find((p) => p.id === productId)?.price;
        return price * quantity + acc;
      }, 0);

      const totalItems = orderItems.reduce((acc, { quantity }) => {
        return acc + quantity;
      }, 0);

      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany: {
              data: orderItems.map(({ quantity, productId }) => ({
                price: products.find((p) => p.id === productId)?.price,
                quantity: quantity,
                productId: productId,
              })),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });

      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
          ...orderItem,
          name: products.find((p) => p.id === orderItem.productId)?.name,
        })),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
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
      include: {
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });

    if (!order) {
      throw new RpcException({
        message: `Order with ID "${id}" not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    const productsIds = order.OrderItem.map((item) => item.productId);
    const products: ProductDto[] = await firstValueFrom(
      this.client.send('validateProducts', productsIds),
    );

    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        name: products.find((p) => p.id === orderItem.productId)?.name,
      })),
    };
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
