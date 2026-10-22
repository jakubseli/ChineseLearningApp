import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type CharacterRecord, hsk1Characters, type WordRecord } from './hsk.ts';
import { validate } from './validate.ts';

const word = (hanzi: string, seq: number): WordRecord => ({
  id: `w:${hanzi}:1`,
  hanzi,
  pinyin: 'x',
  pos: null,
  level: 1,
  seq,
  syllabus_version: '2025-11',
  gloss_cs: null,
  review_status: 'draft',
});
const words = [word('饭店', 1), ...Array.from({ length: 299 }, (_, i) => word(String.fromCodePoint(0x4e00 + i), i + 2))];
const chars: CharacterRecord[] = hsk1Characters(words).map((hanzi) => ({ id: `c:${hanzi}`, hanzi, level: 1, radical: '一', note_cs: null, review_status: 'draft' }));
const allStrokes = () => true;
const font = new Set(words.flatMap((w) => [...w.hanzi]));

test('valid content has no problems', () => {
  assert.deepEqual(validate(words, chars, allStrokes, font), []);
});

test('hsk1Characters drops characters taught after HSK 1', () => {
  assert.equal(chars.length, 300);
  assert.ok(chars.some((c) => c.hanzi === '饭'));
  assert.ok(!chars.some((c) => c.hanzi === '店'));
});

test('reports bad word records', () => {
  const bad: WordRecord[] = [{ ...words[0], id: 'w:饭:1' }, { ...words[1], pinyin: '' }, { ...words[2], review_status: 'reviewed' }, ...words.slice(3)];
  assert.deepEqual(validate(bad, chars, allStrokes, font), [
    'word w:饭:1: id must be w:<hanzi>:<sense>',
    `word ${words[1].id}: pinyin missing`,
    `word ${words[2].id}: reviewed but gloss_cs is empty`,
  ]);
});

test('reports duplicate ids and the wrong word count', () => {
  assert.deepEqual(validate([...words, words[0]], chars, allStrokes, font), ['word w:饭店:1: duplicate id', 'expected 300 HSK 1 words, found 301']);
});

test('reports characters missing from or extra to the HSK 1 list', () => {
  const extra: CharacterRecord = { id: 'c:店', hanzi: '店', level: 1, radical: '广', note_cs: null, review_status: 'draft' };
  assert.deepEqual(validate(words, [...chars.slice(1), extra], allStrokes, font), [
    'character 饭: in the HSK 1 words but missing from characters.jsonl',
    'character 店: not on the HSK 1 character list',
  ]);
});

test('reports characters without stroke data', () => {
  assert.deepEqual(validate(words, chars, (h) => h !== '店', font), ['character 店: no stroke data']);
});

test('reports a radical that is not one character', () => {
  const bad = [{ ...chars[0], radical: '' }, { ...chars[1], radical: '亻口' }, ...chars.slice(2)];
  assert.deepEqual(validate(words, bad, allStrokes, font), [
    `character ${chars[0].id}: radical must be one character`,
    `character ${chars[1].id}: radical must be one character`,
  ]);
});

test('reports characters missing from the font subset', () => {
  const partial = new Set([...font].filter((h) => h !== '店'));
  assert.deepEqual(validate(words, chars, allStrokes, partial), ['character 店: not in the font subset, run npm run content:font']);
});
