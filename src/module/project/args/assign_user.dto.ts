import { IsNotEmpty, IsString } from 'class-validator';

export class AssignUserInProject {
  @IsNotEmpty()
  @IsString()
  project_id: string;

  @IsNotEmpty()
  @IsString()
  owner_id: string;

  @IsNotEmpty()
  @IsString()
  owner_type: string;
}
