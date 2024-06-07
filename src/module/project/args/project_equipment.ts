import { IsArray, IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class ProjectEquipment {
  @IsString()
  @IsNotEmpty()
  component_type: string;

  @IsString()
  @IsNotEmpty()
  connection: string;

  @IsString()
  @IsNotEmpty()
  inventory: string;

  @IsString()
  @IsNotEmpty()
  quantity: string;

  @IsEmpty()
  @IsString()
  set_name: string;

  @IsEmpty()
  @IsString()
  voltage: string;

  @IsEmpty()
  @IsString()
  watt: string;

  @IsEmpty()
  @IsString()
  ampere: string;
}

export class ProjectEquipmentInput {
  @IsNotEmpty()
  @IsArray()
  equipments: ProjectEquipment[];
}
