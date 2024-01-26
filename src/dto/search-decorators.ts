import { IsOptional, IsString } from 'class-validator';

export class SearchParamsDto {
  @IsOptional()
  @IsString()
  search?: string;
}
