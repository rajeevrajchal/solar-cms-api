import { IsEmpty, IsString } from 'class-validator';

export class ApproveQuote {
  @IsEmpty()
  @IsString()
  payment: string;
}
