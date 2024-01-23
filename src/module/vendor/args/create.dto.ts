import { IsEmail, IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateVendorInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsEmail()
  @IsString()
  @IsEmpty()
  email: string;

  @IsEmpty()
  @IsString()
  phone: string;

  @IsEmpty()
  @IsString()
  description: string;
}
