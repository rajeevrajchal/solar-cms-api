import { Global, Injectable } from '@nestjs/common';

@Global()
@Injectable()
export class SlugService {
  generateSlugWithCustomName(name: string): string {
    const currentDate = new Date().getUTCDate();
    const slug = `${name}-${currentDate}`;

    return slug;
  }
}
