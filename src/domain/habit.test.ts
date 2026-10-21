import assert from 'node:assert/strict';
import { test } from 'node:test';

import { streak, studyDay, studyDayEnd } from './habit.ts';

test('a study day starts at 4:00', () => {
  assert.equal(studyDay(new Date(2026, 9, 21, 3, 59)), '2026-10-20');
  assert.equal(studyDay(new Date(2026, 9, 21, 4, 0)), '2026-10-21');
  assert.equal(studyDay(new Date(2026, 9, 21, 23, 59)), '2026-10-21');
  assert.equal(studyDay(new Date(2026, 10, 1, 2, 0)), '2026-10-31');
});

test('studyDayEnd is the next 4:00', () => {
  assert.deepEqual(studyDayEnd(new Date(2026, 9, 21, 10, 0)), new Date(2026, 9, 22, 4, 0));
  assert.deepEqual(studyDayEnd(new Date(2026, 9, 21, 3, 0)), new Date(2026, 9, 21, 4, 0));
  assert.deepEqual(studyDayEnd(new Date(2026, 9, 31, 22, 0)), new Date(2026, 10, 1, 4, 0));
});

// n consecutive days from 2026-10-01, each with the given number of answers
const days = (...counts: number[]) => new Map(counts.map((n, i) => [`2026-10-${String(i + 1).padStart(2, '0')}`, n]));

test('no answers, no streak', () => {
  assert.deepEqual(streak(new Map(), 20, '2026-10-21'), { days: 0, freezes: 0, goalMetToday: false });
});

test('today does not break the streak before it ends, and counts once the goal is met', () => {
  assert.deepEqual(streak(days(20, 25, 30, 5), 20, '2026-10-04'), { days: 3, freezes: 0, goalMetToday: false });
  assert.deepEqual(streak(days(20, 25, 30, 20), 20, '2026-10-04'), { days: 4, freezes: 0, goalMetToday: true });
});

test('a missed day without a freeze resets the streak', () => {
  assert.equal(streak(days(20, 20, 3, 20), 20, '2026-10-05').days, 1);
  // a day with no answers at all is missed too
  assert.equal(streak(new Map([['2026-10-01', 20], ['2026-10-03', 20]]), 20, '2026-10-04').days, 1);
});

test('every 7th streak day earns a freeze, which saves a missed day', () => {
  assert.deepEqual(streak(days(20, 20, 20, 20, 20, 20, 20), 20, '2026-10-08'), { days: 7, freezes: 1, goalMetToday: false });
  assert.deepEqual(streak(days(20, 20, 20, 20, 20, 20, 20, 0, 20), 20, '2026-10-10'), { days: 8, freezes: 0, goalMetToday: false });
});

test('at most 2 freezes are held', () => {
  assert.equal(streak(days(...Array(21).fill(20)), 20, '2026-10-22').freezes, 2);
});
