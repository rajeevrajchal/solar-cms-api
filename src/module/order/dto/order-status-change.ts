import { IsEmpty, IsString } from 'class-validator';

export class OrderStatusChange {
  @IsEmpty()
  @IsString()
  reason?: string;
}
