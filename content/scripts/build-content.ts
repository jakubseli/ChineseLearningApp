import { execSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { drizzle } from 'drizzle-orm/sqlite-proxy';

import { characters, words } from '../../src/data/content-schema.ts';
import { readJsonl } from './jsonl.ts';

const out = 'content/build/content.db';
const wordRecords = readJsonl('content/source/words.jsonl');
const charRecords = readJsonl('content/source/characters.jsonl');

rmSync(out, { force: true });
mkdirSync('content/build', { recursive: true });
const sqlite = new DatabaseSync(out);
sqlite.exec(execSync('npx drizzle-kit export --dialect=sqlite --schema=src/data/content-schema.ts', { encoding: 'utf8' }));

const db = drizzle(async (sql, params) => {
  sqlite.prepare(sql).run(...params);
  return { rows: [] };
});
await db.insert(words).values(wordRecords);
await db.insert(characters).values(charRecords);

for (const [table, expected] of [['words', wordRecords.length], ['characters', charRecords.length]] as const) {
  const { n } = sqlite.prepare(`SELECT count(*) AS n FROM ${table}`).get() as { n: number };
  if (n !== expected) throw new Error(`${table}: ${n} rows in content.db, ${expected} records in the source`);
}
sqlite.close();
console.log(`${out}: ${wordRecords.length} words, ${charRecords.length} characters`);
