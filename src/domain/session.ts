import { State } from 'ts-fsrs';

import type { StudyCard } from './cards.ts';
import { studyDay, studyDayEnd } from './habit.ts';

const LEARN_AHEAD_MS = 20 * 60_000;

export type SessionInput = {
  cards: StudyCard[];
  order: string[];
  newPerDay: number;
};

export type Next = { card: StudyCard } | { newWord: string } | null;

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

export function newWordsToday({ cards, order, newPerDay }: SessionInput, now: Date): string[] {
  const today = studyDay(now);
  const introduced = new Set(cards.map((c) => c.itemId));
  const introducedToday = new Set(cards.filter((c) => c.introducedOn === today).map((c) => c.itemId)).size;
  return order.filter((id) => !introduced.has(id)).slice(0, Math.max(0, newPerDay - introducedToday));
}

export function nextCard(input: SessionInput, now: Date): Next {
  const due = dueCards(input.cards, now);
  const shortTerm = (c: StudyCard) => c.fsrs.state !== State.Review;
  const ready = due.find((c) => shortTerm(c) && c.fsrs.due <= now) ?? due.find((c) => !shortTerm(c));
  if (ready) return { card: ready };
  const [newWord] = newWordsToday(input, now);
  if (newWord) return { newWord };
  const soon = due.find((c) => +c.fsrs.due - +now <= LEARN_AHEAD_MS);
  return soon ? { card: soon } : null;
}
