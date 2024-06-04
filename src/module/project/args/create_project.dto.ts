import { ProjectType } from '@prisma/client';
import { IsBoolean, IsEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProjectInput {
  @IsEmpty()
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
  area: number;

  @IsEmpty()
  @IsNumber()
  orientation: string;

  @IsEmpty()
  @IsNumber()
  shading_factors: number;

  @IsEmpty()
  @IsNumber()
  solar_irradiance: number;

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
  @IsNumber()
  electrical_capacity: number;

  @IsEmpty()
  @IsNumber()
  tilt_angle: string;

  @IsEmpty()
  @IsString()
  panel_type: string;

  @IsEmpty()
  @IsString()
  customer_id: string;

  @IsEmpty()
  @IsString()
  location: string;

  @IsEmpty()
  @IsString()
  parent_id: string;

  @IsEmpty()
  @IsString()
  type: ProjectType;

  @IsEmpty()
  @IsBoolean()
  mark_location_customer: boolean;
}
