// Pure content checks. Returns every problem found, so one run shows all of them.
import { type CharacterRecord, hsk1Characters, type WordRecord } from './hsk.ts';

const HSK1_WORD_COUNT = 300;
const STATUSES = ['draft', 'reviewed'];

const text = (v: unknown) => typeof v === 'string' && v !== '';
const textOrNull = (v: unknown) => v === null || typeof v === 'string';

export function validate(words: WordRecord[], chars: CharacterRecord[], hasStrokes: (hanzi: string) => boolean): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const check = (ok: boolean, message: string) => ok || errors.push(message);

  // shortcut: HSK 1 only (level and count); extend when HSK 2 words are imported
  for (const w of words) {
    const at = `word ${w.id ?? JSON.stringify(w)}`;
    check(!ids.has(w.id), `${at}: duplicate id`);
    ids.add(w.id);
    check(text(w.hanzi) && /^w:[^:]+:[1-9]\d*$/.test(w.id) && w.id.split(':')[1] === w.hanzi, `${at}: id must be w:<hanzi>:<sense>`);
    check(text(w.pinyin), `${at}: pinyin missing`);
    check(textOrNull(w.pos), `${at}: pos must be text or null`);
    check(w.level === 1, `${at}: level must be 1`);
    check(Number.isInteger(w.seq) && w.seq > 0, `${at}: seq must be a positive integer`);
    check(w.syllabus_version === '2025-11', `${at}: syllabus_version must be 2025-11`);
    check(textOrNull(w.gloss_cs), `${at}: gloss_cs must be text or null`);
    check(STATUSES.includes(w.review_status), `${at}: review_status must be draft or reviewed`);
    check(w.review_status !== 'reviewed' || text(w.gloss_cs), `${at}: reviewed but gloss_cs is empty`);
  }
  check(words.length === HSK1_WORD_COUNT, `expected ${HSK1_WORD_COUNT} HSK 1 words, found ${words.length}`);

  for (const c of chars) {
    const at = `character ${c.id ?? JSON.stringify(c)}`;
    check(!ids.has(c.id), `${at}: duplicate id`);
    ids.add(c.id);
    check(text(c.hanzi) && [...c.hanzi].length === 1 && c.id === `c:${c.hanzi}`, `${at}: id must be c:<one hanzi>`);
    check(c.level === 1, `${at}: level must be 1`);
    check(text(c.radical) && [...c.radical].length === 1, `${at}: radical must be one character`);
    check(textOrNull(c.note_cs), `${at}: note_cs must be text or null`);
    check(STATUSES.includes(c.review_status), `${at}: review_status must be draft or reviewed`);
  }

  // The checks below read hanzi from every record, so they need the shapes above to be right.
  if (errors.length) return errors;

  const expected = new Set(hsk1Characters(words));
  const actual = new Set(chars.map((c) => c.hanzi));
  for (const h of expected) check(actual.has(h), `character ${h}: in the HSK 1 words but missing from characters.jsonl`);
  for (const h of actual) check(expected.has(h), `character ${h}: not on the HSK 1 character list`);

  for (const h of new Set([...words.flatMap((w) => [...w.hanzi]), ...actual])) check(hasStrokes(h), `character ${h}: no stroke data`);

  return errors;
}
