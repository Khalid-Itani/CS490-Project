// backend/src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Try loading .env from the process cwd (when scripts are run from project root)
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
  override: true, // force .env here to win over any Windows env vars
});

// If dotenv didn't populate DB_PASSWORD (possible when Nest/ts-node changes cwd),
// also try loading `.env` relative to this source file so compiled `dist` or ts-node
// both get the file.
if (!process.env.DB_PASSWORD) {
  dotenv.config({
    path: path.resolve(__dirname, '../.env'),
    override: false,
  });
}

// Debug: show what Node actually sees for DB env values (mask password)
const _dbPwd = process.env.DB_PASSWORD;
const pwdType = typeof _dbPwd;
const pwdPreview = pwdType === 'string' ? (_dbPwd && _dbPwd.length ? `${_dbPwd[0]}***` : '<empty>') : String(_dbPwd);
console.log('[DB] host=%s user=%s db=%s pwdType=%s pwdPreview=%s',
  process.env.DB_HOST, process.env.DB_USERNAME ?? process.env.DB_USER, process.env.DB_NAME, pwdType, pwdPreview);

const useInMemorySqlite = String(process.env.DEV_NO_DB ?? '') === '1';

export const AppDataSource = useInMemorySqlite
  ? new DataSource({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [path.join(__dirname, '**/*.entity.{ts,js}')],
      migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
      migrationsTableName: 'migrations',
    })
  : new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: String(process.env.DB_USERNAME ?? process.env.DB_USER ?? ''),
      password: String(process.env.DB_PASSWORD ?? ''),
      database: process.env.DB_NAME || 'cs490',
      synchronize: true,
      logging: false,
      entities: [path.join(__dirname, '**/*.entity.{ts,js}')],
      migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
      migrationsTableName: 'migrations',
    });
