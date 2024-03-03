import { IsBoolean, IsEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateOrder {
  @IsEmpty()
  @IsNumber()
  payment: number;

  @IsEmpty()
  @IsBoolean()
  full_payment: boolean;

  @IsEmpty()
  @IsString()
  name: string;
}
