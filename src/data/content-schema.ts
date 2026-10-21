// Schema of content.db, the read-only database that `npm run content:build` makes from content/source.
// Shared by the build script and the app. Column names match the JSONL fields, so records insert as they are.
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const reviewStatus = () => text({ enum: ['draft', 'reviewed'] }).notNull();

export const words = sqliteTable('words', {
  id: text().primaryKey(), // w:<hanzi>:<sense>
  hanzi: text().notNull(),
  pinyin: text().notNull(),
  pos: text(),
  level: integer().notNull(),
  seq: integer().notNull(),
  gloss_cs: text(),
  review_status: reviewStatus(),
});

export const characters = sqliteTable('characters', {
  id: text().primaryKey(), // c:<hanzi>
  hanzi: text().notNull(),
  level: integer().notNull(),
  radical: text().notNull(),
  note_cs: text(),
  review_status: reviewStatus(),
});
