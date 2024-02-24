import { IsOptional, IsString } from 'class-validator';
import { PaginationParamsDto } from 'src/dto/pagination-decorators';

export class QueryParamsDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsString()
  tab?: string;
}
