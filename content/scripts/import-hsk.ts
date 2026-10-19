// One-time import: words.jsonl is edited by hand afterwards, so this never overwrites it.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { buildRecords, parseCsv } from './hsk.ts';

// shortcut: HSK 1 into a new file only; make it append a level when HSK 2 is added
const level = 1;
const out = 'content/source/words.jsonl';

if (existsSync(out)) {
  console.error(`${out} already exists and is edited by hand now. Not overwriting it.`);
  process.exit(1);
}

const rows = parseCsv(readFileSync('content/raw/wzperson/hsk-3-0-words.csv', 'utf8'));
const records = buildRecords(rows, level);

if (new Set(records.map((r) => r.id)).size !== records.length) throw new Error('Duplicate word IDs');

mkdirSync('content/source', { recursive: true });
writeFileSync(out, records.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log(`${records.length} HSK ${level} words -> ${out}`);
