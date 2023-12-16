import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import ContextType from './types/context.type';
import { join } from 'path';
import { corsOptions } from './constants/cors.constant';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { UserModule } from './modules/user/user.module';
import { ProjectModule } from './modules/project/project.module';
import { MailModule } from './modules/mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      context: ({ req, res }): ContextType => ({
        req,
        res,
      }),
      csrfPrevention: {
        requestHeaders: ['content-type'],
      },
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      cors: corsOptions,
      debug: true,
    }),
    AuthModule,
    UserModule,
    ProjectModule,
    MailModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {
  logger: ['error', 'warn'];
  bufferLogs: true;
}
