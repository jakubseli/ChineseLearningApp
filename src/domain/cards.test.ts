import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Rating, State } from 'ts-fsrs';

import { answer, cardId, introduce, wordStatus } from './cards.ts';

const now = new Date(2026, 9, 21, 10, 0);
const DAY = 86_400_000;

test('cardId joins the word id and the card kind', () => {
  assert.equal(cardId('w:学生:1', 'rec'), 'w:学生:1#rec');
});

test('introduce creates a new rec and prod card', () => {
  const made = introduce('w:学生:1', false, '2026-10-21', now);
  assert.deepEqual(
    made.map(({ card, log }) => [card.id, card.kind, card.introducedOn, card.fsrs.state, log]),
    [
      ['w:学生:1#rec', 'rec', '2026-10-21', State.New, undefined],
      ['w:学生:1#prod', 'prod', '2026-10-21', State.New, undefined],
    ],
  );
});

test('"Už znám" answers both cards Easy, so they come back after days', () => {
  for (const { card, log } of introduce('w:学生:1', true, '2026-10-21', now)) {
    assert.equal(log?.rating, Rating.Easy);
    assert.equal(card.fsrs.state, State.Review);
    assert.ok(+card.fsrs.due - +now >= DAY);
  }
});

test('"Vím" on a new card starts a short learning step', () => {
  const [{ card }] = introduce('w:学生:1', false, '2026-10-21', now);
  const next = answer(card, 'good', now);
  assert.equal(next.card.fsrs.state, State.Learning);
  assert.ok(+next.card.fsrs.due - +now < 60 * 60_000);
  assert.equal(next.log.rating, Rating.Good);
  assert.equal(next.card.id, card.id);
});

test('wordStatus follows the rec card', () => {
  const fresh = introduce('w:学生:1', false, '2026-10-21', now).map((m) => m.card);
  const known = introduce('w:学生:1', true, '2026-10-21', now).map((m) => m.card);
  assert.equal(wordStatus([]), 'new');
  assert.equal(wordStatus(fresh), 'learning');
  assert.equal(wordStatus(known), 'known');
});
