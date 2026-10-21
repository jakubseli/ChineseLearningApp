import assert from 'node:assert/strict';
import { test } from 'node:test';

import { searchKey, wordMatches } from './search.ts';

test('searchKey drops tone marks, Czech diacritics, case and spacing', () => {
  assert.equal(searchKey('xuéshēng'), 'xuesheng');
  assert.equal(searchKey('Lǜ'), 'lu');
  assert.equal(searchKey('lv'), 'lu');
  assert.equal(searchKey("Xī'ān"), 'xian');
  assert.equal(searchKey('Dobrý den'), 'dobryden');
});

test('a word matches by hanzi, toneless pinyin or Czech', () => {
  const word = { hanzi: '学生', pinyin: 'xuéshēng', gloss_cs: 'student, žák' };
  for (const q of ['学', 'xue sheng', 'XUESHENG', 'zak', '']) assert.ok(wordMatches(word, q), q);
  assert.ok(!wordMatches(word, 'učitel'));
  assert.ok(wordMatches({ ...word, gloss_cs: null }, 'xue'));
});
