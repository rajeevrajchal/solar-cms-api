import { IsNotEmpty, IsEmpty, IsString, IsNumber } from 'class-validator';

export class CreateQuoteInput {
  @IsEmpty()
  @IsNumber()
  name: string;

  @IsEmpty()
  @IsNumber()
  net_total: string;

  @IsEmpty()
  @IsNumber()
  installation_cost: string;

  @IsEmpty()
  @IsNumber()
  discount: string;

  @IsEmpty()
  @IsNumber()
  adjustment: string;

  @IsEmpty()
  @IsNumber()
  vat: string;

  @IsNotEmpty()
  @IsString()
  project_id: string;
}
