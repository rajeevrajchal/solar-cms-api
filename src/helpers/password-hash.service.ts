import { Global, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Global()
@Injectable()
export class PasswordHashService {
  async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  async hashCompare(argA: string, argB: string): Promise<boolean> {
    return bcrypt.compare(argA, argB);
  }
}
