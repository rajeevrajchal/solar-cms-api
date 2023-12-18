import { IsNotEmpty, IsString, IsEmail, IsEmpty } from 'class-validator';

export class CustomerInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}
