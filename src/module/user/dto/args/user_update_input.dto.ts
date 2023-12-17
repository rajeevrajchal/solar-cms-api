import { IsOptional, IsBoolean, IsString, IsDate } from 'class-validator';
import { UserInput } from './user_input.dto';

export class UserUpdateInput extends UserInput {
  @IsOptional()
  @IsBoolean()
  is_temp: boolean;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  @IsDate()
  deletedAt: Date;
}
