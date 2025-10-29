import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
  // Debug: print both the raw process.env value and ConfigService value
  // so we can see where DEV_NO_DB=1 is coming from when the app starts.
  const rawEnv = process.env.DEV_NO_DB;
  const cfgVal = config.get('DEV_NO_DB');
  console.log('[DEBUG] process.env.DEV_NO_DB=%s config.get("DEV_NO_DB")=%s', rawEnv, cfgVal);

  // Prefer using Postgres if a DB name is configured. Some environments
  // may still have DEV_NO_DB set (e.g. legacy system env); treat DEV_NO_DB
  // as a soft opt-out only when no DB_NAME is present.
  const hasDbName = !!String(config.get('DB_NAME') ?? process.env.DB_NAME);
  const noDb = !hasDbName && String(cfgVal ?? '') === '1';

        if (noDb) {
          console.log('💡 DEV_NO_DB=1 -> using in-memory SQLite');
          return {
            type: 'sqlite' as const,
            database: ':memory:',
            autoLoadEntities: true,
            synchronize: true,
          };
        }

        const ssl =
          String(config.get('DB_SSL') ?? 'false') === 'true'
            ? { rejectUnauthorized: false }
            : false;

        return {
          type: 'postgres' as const,
          host: String(config.get('DB_HOST') ?? 'localhost'),
          port: Number(config.get('DB_PORT') ?? 5432),
          username: String(config.get('DB_USERNAME') ?? ''),
          password: String(config.get('DB_PASSWORD') ?? ''), // force string
          database: String(config.get('DB_NAME') ?? ''),
          ssl,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    UsersModule,
  ],
})
export class AppModule {}
