import { IsEmpty, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class InventoryInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsNumber()
  voltage: string;

  @IsNotEmpty()
  @IsNumber()
  buying_cost: string;

  @IsNotEmpty()
  @IsNumber()
  selling_cost: string;

  @IsEmpty()
  @IsNumber()
  max_flat_discount: string;

  @IsEmpty()
  @IsNumber()
  max_discount: string;

  @IsString()
  @IsEmpty()
  nature: string;

  @IsEmpty()
  @IsNumber()
  watt: string;

  @IsEmpty()
  @IsNumber()
  ampere: string;

  @IsEmpty()
  @IsString()
  description: string;

  @IsEmpty()
  @IsString()
  vendor_id: string;

  @IsEmpty()
  @IsString()
  product_image: string;
}
