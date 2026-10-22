export type ReviewStatus = 'draft' | 'reviewed';

export type WordRecord = {
  id: string;
  hanzi: string;
  pinyin: string;
  pos: string | null;
  level: number;
  seq: number;
  syllabus_version: '2025-11';
  gloss_cs: string | null;
  review_status: ReviewStatus;
};

export type CharacterRecord = {
  id: string;
  hanzi: string;
  level: number;
  radical: string;
  note_cs: string | null;
  review_status: ReviewStatus;
};

const HSK1_LATER_CHARS = ['店', '饺'];

// shortcut: HSK 1 only; HSK 2 needs its own exceptions and must skip characters already in HSK 1
export function hsk1Characters(words: WordRecord[]): string[] {
  const chars = new Set(words.filter((w) => w.level === 1).flatMap((w) => [...w.hanzi]));
  return [...chars].filter((c) => !HSK1_LATER_CHARS.includes(c));
}
