import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const reviewStatus = () => text({ enum: ['draft', 'reviewed'] }).notNull();

export const words = sqliteTable('words', {
  id: text().primaryKey(),
  hanzi: text().notNull(),
  pinyin: text().notNull(),
  pos: text(),
  level: integer().notNull(),
  seq: integer().notNull(),
  gloss_cs: text(),
  review_status: reviewStatus(),
});

export const characters = sqliteTable('characters', {
  id: text().primaryKey(),
  hanzi: text().notNull(),
  level: integer().notNull(),
  radical: text().notNull(),
  note_cs: text(),
  review_status: reviewStatus(),
});
