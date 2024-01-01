import {
  IsArray,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';

export class ProjectComponent {
  @IsNotEmpty()
  @IsString()
  component_type: string;

  @IsNotEmpty()
  @IsString()
  connection_type: string;

  @IsEmpty()
  @IsString()
  nature: string;

  @IsEmpty()
  @IsString()
  name: string;

  @IsEmpty()
  @IsNumber()
  voltage: number;

  @IsEmpty()
  @IsNumber()
  amperage: number;

  @IsEmpty()
  @IsNumber()
  aging: number;

  @IsEmpty()
  @IsNumber()
  dod: number;

  @IsEmpty()
  @IsNumber()
  each_item_rating_volts: number;

  @IsEmpty()
  @IsNumber()
  each_item_rating_ampre: number;

  @IsEmpty()
  @IsNumber()
  quantity: number;
}

export class SunHour {
  @IsEmpty()
  @IsNumber()
  sun_hour_monsoon: number;

  @IsEmpty()
  @IsNumber()
  sun_hour_winter: number;

  @IsEmpty()
  @IsNumber()
  sun_hour_summer: number;
}

export class ProjectInsightInput {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsArray()
  components: ProjectComponent[];

  @IsNotEmpty()
  @IsObject()
  sun_hours: SunHour;
}
