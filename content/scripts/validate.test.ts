import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildCharacters, type CharacterRecord, type WordRecord } from './hsk.ts';
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
// 300 words, like HSK 1; 饭店 brings in 店, which is not an HSK 1 character
const words = [word('饭店', 1), ...Array.from({ length: 299 }, (_, i) => word(String.fromCodePoint(0x4e00 + i), i + 2))];
const chars = buildCharacters(words, new Map(words.flatMap((w) => [...w.hanzi]).map((h) => [h, '一'])));
const allStrokes = () => true;

test('valid content has no problems', () => {
  assert.deepEqual(validate(words, chars, allStrokes), []);
});

test('buildCharacters drops characters taught after HSK 1', () => {
  assert.equal(chars.length, 300);
  assert.ok(chars.some((c) => c.hanzi === '饭'));
  assert.ok(!chars.some((c) => c.hanzi === '店'));
});

test('buildCharacters fails on a character without a radical', () => {
  assert.throws(() => buildCharacters(words, new Map()), /character 饭: no radical in Unihan/);
});

test('reports bad word records', () => {
  const bad: WordRecord[] = [{ ...words[0], id: 'w:饭:1' }, { ...words[1], pinyin: '' }, { ...words[2], review_status: 'reviewed' }, ...words.slice(3)];
  assert.deepEqual(validate(bad, chars, allStrokes), [
    'word w:饭:1: id must be w:<hanzi>:<sense>',
    `word ${words[1].id}: pinyin missing`,
    `word ${words[2].id}: reviewed but gloss_cs is empty`,
  ]);
});

test('reports duplicate ids and the wrong word count', () => {
  assert.deepEqual(validate([...words, words[0]], chars, allStrokes), ['word w:饭店:1: duplicate id', 'expected 300 HSK 1 words, found 301']);
});

test('reports characters missing from or extra to the HSK 1 list', () => {
  const extra: CharacterRecord = { id: 'c:店', hanzi: '店', level: 1, radical: '广', note_cs: null, review_status: 'draft' };
  assert.deepEqual(validate(words, [...chars.slice(1), extra], allStrokes), [
    'character 饭: in the HSK 1 words but missing from characters.jsonl',
    'character 店: not on the HSK 1 character list',
  ]);
});

test('reports characters without stroke data', () => {
  assert.deepEqual(validate(words, chars, (h) => h !== '店'), ['character 店: no stroke data']);
});

test('reports a radical that is not one character', () => {
  const bad = [{ ...chars[0], radical: '' }, { ...chars[1], radical: '亻口' }, ...chars.slice(2)];
  assert.deepEqual(validate(words, bad, allStrokes), [
    `character ${chars[0].id}: radical must be one character`,
    `character ${chars[1].id}: radical must be one character`,
  ]);
});
