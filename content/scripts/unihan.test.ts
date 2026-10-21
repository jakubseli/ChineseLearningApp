import assert from 'node:assert/strict';
import { test } from 'node:test';

import { unihanRadicals } from './unihan.ts';

const radicals = ['# comment', '9; 2F08; 4EBA', "149'; 2EC8; 8BA0", '35; 2F22; 590A', ''].join('\r\n');

test('maps characters to their radical', () => {
  const unihan = ['# comment', 'U+4F60\tkRSUnicode\t9.5', "U+8BF4\tkRSUnicode\t149'.7", ''].join('\n');
  assert.deepEqual(
    unihanRadicals(unihan, radicals),
    new Map([
      ['你', '人'],
      ['说', '讠'],
    ]),
  );
});

test('takes the first of several radicals and handles CRLF', () => {
  assert.deepEqual(unihanRadicals('U+3687\tkRSUnicode\t35.6 66.6\r\n', radicals), new Map([[String.fromCodePoint(0x3687), String.fromCodePoint(0x590a)]]));
});

test('skips characters whose radical is not in CJKRadicals', () => {
  assert.deepEqual(unihanRadicals('U+4E00\tkRSUnicode\t1.0\n', radicals), new Map());
});
