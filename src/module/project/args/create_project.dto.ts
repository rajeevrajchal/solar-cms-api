import {
  IsNotEmpty,
  IsEmpty,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateProjectInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmpty()
  @IsNumber()
  latitude: number;

  @IsEmpty()
  @IsNumber()
  longitude: number;

  @IsEmpty()
  @IsNumber()
  actual_area: number;

  @IsEmpty()
  @IsNumber()
  sun_hour_summer: number;

  @IsEmpty()
  @IsNumber()
  sun_hour_winter: number;

  @IsEmpty()
  @IsNumber()
  sun_hour_monsoon: number;

  @IsEmpty()
  @IsNumber()
  sun_direction: string;

  @IsEmpty()
  @IsNumber()
  total_sun_power_need: number;

  @IsEmpty()
  @IsNumber()
  correction_factor: number;

  @IsEmpty()
  @IsNumber()
  reserve_power_for: number;

  @IsEmpty()
  @IsNumber()
  power_out_voltage: number;

  @IsEmpty()
  @IsNumber()
  power_out_watt: number;

  @IsEmpty()
  @IsBoolean()
  cleaning: boolean;

  @IsNotEmpty()
  @IsBoolean()
  customer_id: string;

  @IsEmpty()
  @IsBoolean()
  parent_id: string;
}
