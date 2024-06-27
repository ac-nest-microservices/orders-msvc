import { IsEnum, IsUUID } from 'class-validator';
import { OrderStatus } from '@prisma/client';

import { OrderStatusList } from '../enum/order.enum';

export class ChangeOrderStatusDto {
  @IsUUID(4)
  id: string;

  @IsEnum(OrderStatusList, {
    message: `Status must be one of these: ${OrderStatusList}`,
  })
  status: OrderStatus;
}
