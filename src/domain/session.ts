// Picks what to study next. Called after every answer with fresh cards from the database,
// so there is no queue to keep in sync.
import { State } from 'ts-fsrs';

import type { StudyCard } from './cards.ts';
import { studyDay, studyDayEnd } from './habit.ts';

export const NEW_WORDS_PER_DAY = 10;
const LEARN_AHEAD_MS = 20 * 60_000; // with nothing else left, learning cards may come up to 20 min early

export type SessionInput = {
  cards: StudyCard[]; // every card in progress.db
  order: string[]; // word ids in teaching order
  newPerDay: number;
};

export type Next = { card: StudyCard } | { newWord: string } | null;

// Cards due by the end of the study day, at most one per word: once a card of a word was answered today,
// the word's other cards wait for tomorrow (siblings buried). Of two due cards of one word, the earlier wins.
export function dueCards(cards: StudyCard[], now: Date): StudyCard[] {
  const today = studyDay(now);
  const end = studyDayEnd(now);
  const answeredToday = (c: StudyCard) => c.fsrs.last_review !== undefined && studyDay(c.fsrs.last_review) === today;
  const busy = new Set(cards.filter(answeredToday).map((c) => c.itemId));
  const pick = new Map<string, StudyCard>();
  for (const c of cards) {
    if (c.fsrs.due >= end || (busy.has(c.itemId) && !answeredToday(c))) continue;
    const other = pick.get(c.itemId);
    if (!other || c.fsrs.due < other.fsrs.due) pick.set(c.itemId, c);
  }
  return [...pick.values()].sort((a, b) => +a.fsrs.due - +b.fsrs.due);
}

// Words not introduced yet, in teaching order, as many as today's limit still allows.
export function newWordsToday({ cards, order, newPerDay }: SessionInput, now: Date): string[] {
  const today = studyDay(now);
  const introduced = new Set(cards.map((c) => c.itemId));
  const introducedToday = new Set(cards.filter((c) => c.introducedOn === today).map((c) => c.itemId)).size;
  return order.filter((id) => !introduced.has(id)).slice(0, Math.max(0, newPerDay - introducedToday));
}

// Order: learning cards that are due now, then today's reviews, then a new word, then learning cards due soon.
export function nextCard(input: SessionInput, now: Date): Next {
  const due = dueCards(input.cards, now);
  const shortTerm = (c: StudyCard) => c.fsrs.state !== State.Review; // new, learning or relearning: minute steps
  const ready = due.find((c) => shortTerm(c) && c.fsrs.due <= now) ?? due.find((c) => !shortTerm(c));
  if (ready) return { card: ready };
  const [newWord] = newWordsToday(input, now);
  if (newWord) return { newWord };
  const soon = due.find((c) => +c.fsrs.due - +now <= LEARN_AHEAD_MS);
  return soon ? { card: soon } : null;
}
