import { existsSync, readFileSync } from 'node:fs';

import { readJsonl } from './jsonl.ts';
import { validate } from './validate.ts';

const errors = validate(
  readJsonl('content/source/words.jsonl'),
  readJsonl('content/source/characters.jsonl'),
  (hanzi) => existsSync(`node_modules/hanzi-writer-data/${hanzi}.json`),
  new Set(readFileSync('assets/fonts/noto_sans_sc_chars.txt', 'utf8')),
);

if (errors.length) {
  console.error(`${errors.join('\n')}\n${errors.length} problem(s)`);
  process.exit(1);
}
console.log('Content OK');
