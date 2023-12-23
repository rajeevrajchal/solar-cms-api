import { Project } from '@prisma/client';

export class ProjectResponse {
  message: string;
  project?: Partial<Project> | null;
}
