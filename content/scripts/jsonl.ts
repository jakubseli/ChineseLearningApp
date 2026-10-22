import { readFileSync } from 'node:fs';

export const readJsonl = (path: string) =>
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
