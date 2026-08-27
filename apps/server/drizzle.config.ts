import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import {env} from '../server/src/env.js'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.database!,
  },
});
