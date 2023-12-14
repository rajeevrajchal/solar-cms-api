import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHashService {
  async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }
}
