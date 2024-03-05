import { ProjectStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangeProjectStatus {
  @IsNotEmpty()
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}
