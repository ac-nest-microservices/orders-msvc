import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';

import { PaginationDto } from '../../common';
import { OrderStatusList } from '../enum/order.enum';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Status must be one of these: ${OrderStatusList}`,
  })
  status: OrderStatus;
}
