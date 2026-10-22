import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createEmptyCard, State } from 'ts-fsrs';

import { answer, introduce, type StudyCard } from './cards.ts';
import { dueCards, newWordsToday, nextCard } from './session.ts';

const now = new Date(2026, 9, 21, 10, 0);
const today = '2026-10-21';
const order = ['w:一:1', 'w:二:1', 'w:三:1'];
const fresh = (itemId: string) => introduce(itemId, false, today, now).map((m) => m.card);

const review = (itemId: string, kind: 'rec' | 'prod', due: Date): StudyCard => ({
  id: `${itemId}#${kind}`,
  itemId,
  kind,
  introducedOn: '2026-10-01',
  fsrs: { ...createEmptyCard(now), state: State.Review, due, last_review: new Date(2026, 9, 10, 9, 0) },
});

test('with no cards, the first word in teaching order comes next', () => {
  assert.deepEqual(nextCard({ cards: [], order, newPerDay: 10 }, now), { newWord: 'w:一:1' });
});

test('a just introduced word is asked right away, rec card first', () => {
  const next = nextCard({ cards: fresh('w:一:1'), order, newPerDay: 10 }, now);
  assert.equal(next && 'card' in next && next.card.id, 'w:一:1#rec');
});

test('after an answer, the word’s other card waits for tomorrow', () => {
  const [rec, prod] = fresh('w:一:1');
  const answered = answer(rec, 'good', now).card;
  assert.deepEqual(
    dueCards([answered, prod], now).map((c) => c.id),
    ['w:一:1#rec'],
  );
});

test('the daily limit counts words introduced today', () => {
  const cards = [...fresh('w:一:1'), ...fresh('w:二:1')];
  assert.deepEqual(newWordsToday({ cards, order, newPerDay: 3 }, now), ['w:三:1']);
  assert.deepEqual(newWordsToday({ cards, order, newPerDay: 2 }, now), []);
});

test('a learning card due now comes before reviews, reviews before new words', () => {
  const learning = answer(fresh('w:一:1')[0], 'again', new Date(+now - 10 * 60_000)).card;
  const rev = review('w:二:1', 'rec', new Date(2026, 9, 21, 20, 0));
  const input = { cards: [rev, learning], order, newPerDay: 10 };
  assert.equal((nextCard(input, now) as { card: StudyCard }).card.id, 'w:一:1#rec');
  assert.equal((nextCard({ ...input, cards: [rev] }, now) as { card: StudyCard }).card.id, 'w:二:1#rec');
});

test('reviews due after 4:00 tomorrow are not shown today', () => {
  const tomorrow = review('w:一:1', 'rec', new Date(2026, 9, 22, 5, 0));
  assert.deepEqual(dueCards([tomorrow], now), []);
});

test('of two due cards of one word, only the earlier one is shown', () => {
  const cards = [review('w:一:1', 'rec', new Date(2026, 9, 21, 9, 0)), review('w:一:1', 'prod', new Date(2026, 9, 20, 9, 0))];
  assert.deepEqual(
    dueCards(cards, now).map((c) => c.id),
    ['w:一:1#prod'],
  );
});

test('with nothing else left, a learning card due within 20 minutes comes early, later ones end the session', () => {
  const soon = answer(fresh('w:一:1')[0], 'good', new Date(+now - 60_000)).card;
  const input = { cards: [soon], order, newPerDay: 1 };
  assert.equal((nextCard(input, now) as { card: StudyCard }).card.id, 'w:一:1#rec');
  assert.equal(nextCard(input, new Date(+now - 30 * 60_000)), null);
});
