import { IsNotEmpty, IsString } from 'class-validator';
import { CreateProjectInput } from './create_project.dto';

export class UpdateProjectInput extends CreateProjectInput {
  @IsNotEmpty()
  @IsString()
  id: string;
}
