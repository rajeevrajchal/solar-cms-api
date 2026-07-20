import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error'],
    rawBody: true,
    snapshot: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: true,
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });
  const port = process.env.PORT || 3000;
  console.log('App Running in port', 3000);
  await app.listen(port);
}
bootstrap();
