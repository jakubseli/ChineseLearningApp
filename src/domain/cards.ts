import { createEmptyCard, fsrs, Rating, State, type Card, type ReviewLog } from 'ts-fsrs';

// rec: hanzi -> Czech, prod: Czech -> hanzi
export type CardKind = 'rec' | 'prod';
const CARD_KINDS: readonly CardKind[] = ['rec', 'prod'];

export type StudyCard = {
  id: string;
  itemId: string;
  kind: CardKind;
  introducedOn: string;
  fsrs: Card;
};

export type Answer = 'again' | 'good' | 'easy';
const GRADE = { again: Rating.Again, good: Rating.Good, easy: Rating.Easy } as const;

const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true });

export const cardId = (itemId: string, kind: CardKind) => `${itemId}#${kind}`;

export function answer(card: StudyCard, a: Answer, now: Date): { card: StudyCard; log: ReviewLog } {
  const next = scheduler.next(card.fsrs, now, GRADE[a]);
  return { card: { ...card, fsrs: next.card }, log: next.log };
}

export function introduce(itemId: string, known: boolean, today: string, now: Date): { card: StudyCard; log?: ReviewLog }[] {
  return CARD_KINDS.map((kind) => {
    const card: StudyCard = { id: cardId(itemId, kind), itemId, kind, introducedOn: today, fsrs: createEmptyCard(now) };
    return known ? answer(card, 'easy', now) : { card };
  });
}

export type WordStatus = 'new' | 'learning' | 'known';

export function wordStatus(cards: StudyCard[]): WordStatus {
  const rec = cards.find((c) => c.kind === 'rec');
  if (!rec) return 'new';
  return rec.fsrs.state === State.Review ? 'known' : 'learning';
}
