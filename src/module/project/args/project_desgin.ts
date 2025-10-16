import { IsNotEmpty } from 'class-validator';

export class ProjectDesign {
  @IsNotEmpty()
  design_file: any;
}
