import { Global, Injectable } from '@nestjs/common';

@Global()
@Injectable()
export class SlugService {
  generateSlugWithCustomName(name: string): string {
    const currentDate = new Date().getUTCDate();
    const currentMonth = new Date().getUTCMonth();
    const currentYear = new Date().getUTCFullYear();
    const currentMili = new Date().getUTCMilliseconds();
    const slug = `${name}-${currentDate}-${currentMonth}-${currentYear}-${currentMili}`;

    return slug;
  }

  generateSlugForQuote(name: string): string {
    const currentDate = new Date().getUTCDate();
    const currentMonth = new Date().getUTCMonth();
    const currentYear = new Date().getUTCFullYear();
    const currentMili = new Date().getUTCMilliseconds();
    const slug = `quote-${name}-${currentDate}-${currentMonth}-${currentYear}-${currentMili}`;

    return slug;
  }
}
