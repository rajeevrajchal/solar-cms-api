import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import ContextType from './types/context.type';
import { join } from 'path';
import { corsOptions } from './constants/cors.constant';

@Module({
  imports: [
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  logger: ['error', 'warn'];
  bufferLogs: true;
}
