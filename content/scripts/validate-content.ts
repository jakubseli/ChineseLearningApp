// Validates the hand-edited content files and exits with an error if anything is wrong.
import { existsSync, readFileSync } from 'node:fs';

import { validate } from './validate.ts';

// Hand-edited files, so report bad JSON with its line number.
const jsonl = (path: string) =>
  readFileSync(path, 'utf8')
    .split('\n')
    .flatMap((line, i) => {
      if (!line.trim()) return [];
      try {
        return [JSON.parse(line)];
      } catch (e) {
        throw new Error(`${path}:${i + 1}: ${(e as Error).message}`);
      }
    });

const errors = validate(
  jsonl('content/source/words.jsonl'),
  jsonl('content/source/characters.jsonl'),
  (hanzi) => existsSync(`node_modules/hanzi-writer-data/${hanzi}.json`),
);

if (errors.length) {
  console.error(`${errors.join('\n')}\n${errors.length} problem(s)`);
  process.exit(1);
}
console.log('Content OK');
