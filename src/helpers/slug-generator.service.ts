import { Injectable } from '@nestjs/common';

@Injectable()
export class SlugService {
  generateSlugWithCustomName(name: string): string {
    const currentDate = new Date().getUTCDate();
    const slug = `${name}-${currentDate}`;

    return slug;
  }
}
