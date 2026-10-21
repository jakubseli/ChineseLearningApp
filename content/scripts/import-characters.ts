// One-time import: characters.jsonl is edited by hand afterwards, so this never overwrites it.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { buildCharacters } from './hsk.ts';
import { unihanRadicals } from './unihan.ts';

const out = 'content/source/characters.jsonl';

if (existsSync(out)) {
  console.error(`${out} already exists and is edited by hand now. Not overwriting it.`);
  process.exit(1);
}

const words = readFileSync('content/source/words.jsonl', 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const radicals = unihanRadicals(readFileSync('content/raw/unihan/Unihan_hsk.txt', 'utf8'), readFileSync('content/raw/unihan/CJKRadicals.txt', 'utf8'));
const records = buildCharacters(words, radicals);

writeFileSync(out, records.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log(`${records.length} HSK 1 characters -> ${out}`);
