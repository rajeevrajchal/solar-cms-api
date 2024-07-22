import { ProjectStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CreateProjectInput } from './create_project.dto';

export class UpdateProjectInput extends CreateProjectInput {
  @IsNotEmpty()
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}
