import { IsNotEmpty, IsEmpty, IsString, IsNumber } from 'class-validator';

export class CreateQuoteInput {
  @IsNotEmpty()
  @IsNumber()
  installation_cost: number;

  @IsEmpty()
  @IsNumber()
  name: string;

  @IsEmpty()
  @IsNumber()
  net_total: number;

  @IsEmpty()
  @IsNumber()
  discount: number;

  @IsEmpty()
  @IsNumber()
  adjustment: number;

  @IsEmpty()
  @IsNumber()
  vat: string;

  @IsNotEmpty()
  @IsString()
  project_id: string;
}
