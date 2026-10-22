import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const ms = () => integer({ mode: 'timestamp_ms' });

export const cards = sqliteTable('cards', {
  id: text().primaryKey(),
  item_id: text().notNull(),
  kind: text({ enum: ['rec', 'prod'] }).notNull(),
  introduced_on: text().notNull(),
  due: ms().notNull(),
  stability: real().notNull(),
  difficulty: real().notNull(),
  elapsed_days: integer().notNull(),
  scheduled_days: integer().notNull(),
  learning_steps: integer().notNull(),
  reps: integer().notNull(),
  lapses: integer().notNull(),
  state: integer().notNull(),
  last_review: ms(),
});

export const review_log = sqliteTable('review_log', {
  id: integer().primaryKey({ autoIncrement: true }),
  card_id: text().notNull(),
  rating: integer().notNull(),
  state: integer().notNull(),
  due: ms().notNull(),
  stability: real().notNull(),
  difficulty: real().notNull(),
  elapsed_days: integer().notNull(),
  last_elapsed_days: integer().notNull(),
  scheduled_days: integer().notNull(),
  learning_steps: integer().notNull(),
  review: ms().notNull(),
  study_day: text().notNull(),
});

export const settings = sqliteTable('settings', {
  key: text().primaryKey(),
  value: text().notNull(),
});
