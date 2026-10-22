import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/data/progress-schema.ts',
  out: './src/data/progress-migrations',
});
