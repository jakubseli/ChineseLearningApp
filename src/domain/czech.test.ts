import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { plural, posLabel } from './czech.ts';

test('Czech plural forms', () => {
  const forms: [string, string, string] = ['slovíčko', 'slovíčka', 'slovíček'];
  assert.deepEqual(
    [0, 1, 2, 4, 5, 22].map((n) => plural(n, forms)),
    ['slovíček', 'slovíčko', 'slovíčka', 'slovíčka', 'slovíček', 'slovíček'],
  );
});

test('part of speech in Czech, less common uses in brackets', () => {
  assert.equal(posLabel('动'), 'sloveso');
  assert.equal(posLabel('量、（名）'), 'počítací slovo (také podstatné jméno)');
  assert.equal(posLabel('形、介、（动、量）'), 'přídavné jméno, předložka (také sloveso, počítací slovo)');
  assert.equal(posLabel('形、（副）、（动）'), 'přídavné jméno (také příslovce, sloveso)');
  assert.equal(posLabel(null), 'ustálené spojení');
});

test('every part-of-speech code in the syllabus has a Czech label', () => {
  const codes = readFileSync('content/raw/wzperson/hsk-3-0-words.csv', 'utf8')
    .split('\n')
    .slice(1)
    .flatMap((line) => (line.split(',')[8] ?? '').replace(/[（）]/g, '').split('、'))
    .map((c) => c.trim())
    .filter(Boolean);
  assert.deepEqual([...new Set(codes)].filter((c) => posLabel(c) === c), []);
});
