import { IsNotEmpty } from 'class-validator';

export class CsvInventoryInput {
  @IsNotEmpty()
  file: Express.Multer.File;
}
