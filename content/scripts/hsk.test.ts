import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildRecords, parseCsv, parseCsvLine } from './hsk.ts';

test('parseCsvLine keeps commas and escaped quotes inside quoted fields', () => {
  assert.deepEqual(parseCsvLine('a,"b,""c""",d'), ['a', 'b,"c"', 'd']);
});

test('parseCsv rejects rows with the wrong number of fields', () => {
  assert.throws(() => parseCsv('a,b\r\n1,2,3\r\n'), /row 2/);
});

const csv = [
  'id,simplified,traditional,pinyin,pinyin_num,hsk3_band,hsk3_seq,hsk2_level,pos_zh,pos_en,gloss_en',
  'w00002,八,八,bā,ba1,1,2,1,数,numeral,eight',
  'w00001,爱,愛,ài,ai4,1,1,1,动,verb,to love',
  'w00300,你好,你好,nǐ hǎo,ni3 hao3,1,3,1,,,hello',
  'w00500,花,花,huā,hua1,3,1,3,动,verb,"to spend, to use"',
  'w00501,花,花,huā,hua1,3,2,3,名,noun,flower',
  'w00900,爱好,愛好,àihào,ai4hao4,2,1,3,名,noun,hobby',
].join('\r\n');

test('buildRecords keeps one level, in syllabus order', () => {
  const records = buildRecords(parseCsv(csv), 1);
  assert.deepEqual(records.map((r) => r.hanzi), ['爱', '八', '你好']);
  assert.deepEqual(records[0], {
    id: 'w:爱:1',
    hanzi: '爱',
    pinyin: 'ài',
    pos: '动',
    level: 1,
    seq: 1,
    syllabus_version: '2025-11',
    gloss_cs: null,
    review_status: 'draft',
  });
  assert.equal(records[2].pos, null);
});

test('buildRecords numbers repeated hanzi as separate senses', () => {
  assert.deepEqual(buildRecords(parseCsv(csv), 3).map((r) => r.id), ['w:花:1', 'w:花:2']);
});
