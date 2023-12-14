import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class PasswordGeneratorService {
  generateRandomPassword(length: number): string {
    const buffer = randomBytes(Math.ceil(length / 2));
    return buffer.toString('hex').slice(0, length);
  }
}
