import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ElectricLoad {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  watt: number;

  @IsNotEmpty()
  @IsNumber()
  hour: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
