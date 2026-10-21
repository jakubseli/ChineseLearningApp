// Cards and scheduling. Every word gets two cards, and ts-fsrs (FSRS-6) decides when each comes back.
import { createEmptyCard, fsrs, Rating, State, type Card, type ReviewLog } from 'ts-fsrs';

export type CardKind = 'rec' | 'prod'; // rec: hanzi -> Czech, prod: Czech -> hanzi
export const CARD_KINDS: readonly CardKind[] = ['rec', 'prod'];

export type StudyCard = {
  id: string; // w:学生:1#rec
  itemId: string; // w:学生:1
  kind: CardKind;
  introducedOn: string; // study day the word was introduced (habit.ts)
  fsrs: Card;
};

// The UI shows "Nevím" / "Vím"; easy is only used by "Už znám".
export type Answer = 'again' | 'good' | 'easy';
const GRADE = { again: Rating.Again, good: Rating.Good, easy: Rating.Easy } as const;

const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true });

export const cardId = (itemId: string, kind: CardKind) => `${itemId}#${kind}`;

export function answer(card: StudyCard, a: Answer, now: Date): { card: StudyCard; log: ReviewLog } {
  const next = scheduler.next(card.fsrs, now, GRADE[a]);
  return { card: { ...card, fsrs: next.card }, log: next.log };
}

// Creates a word's cards. "Už znám" (known) answers each one Easy right away, so the first review is days away.
export function introduce(itemId: string, known: boolean, today: string, now: Date): { card: StudyCard; log?: ReviewLog }[] {
  return CARD_KINDS.map((kind) => {
    const card: StudyCard = { id: cardId(itemId, kind), itemId, kind, introducedOn: today, fsrs: createEmptyCard(now) };
    return known ? answer(card, 'easy', now) : { card };
  });
}

export type WordStatus = 'new' | 'learning' | 'known';

// A word counts as known once its hanzi -> Czech card has graduated to long-term review.
export function wordStatus(cards: StudyCard[]): WordStatus {
  const rec = cards.find((c) => c.kind === 'rec');
  if (!rec) return 'new';
  return rec.fsrs.state === State.Review ? 'known' : 'learning';
}
