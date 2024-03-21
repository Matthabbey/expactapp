import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { User } from '../users/entities';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'mysql',
      host: configService.get('DB_HOST'),
      // port: parseInt(process.env.DB_PORT), //Test
      username: process.env.DB_USERNAME,
      entities: [User],
      database: process.env.DB_DATABASE_NAME, //don't use this in the code as you hve 2 set in your env process.env.DB_NAME
      password: process.env.DB_PASSWORD,
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      extra: {
        charset: 'utf8mb4_unicode_ci',
      },
      synchronize: true,
      logging: false,
    };
  },
};
