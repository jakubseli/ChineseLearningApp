// Pure helpers for the HSK content scripts. No file I/O, so they can be unit-tested.

export type WordRecord = {
  id: string;
  hanzi: string;
  pinyin: string;
  pos: string | null; // official syllabus notation, e.g. "形、介、（动、量）"; bracketed = less common uses
  level: number;
  seq: number; // entry number in the official syllabus (global, so HSK 2 starts at 301)
  syllabus_version: '2025-11';
  gloss_cs: string | null;
  review_status: ReviewStatus;
};

export type CharacterRecord = {
  id: string;
  hanzi: string;
  level: number;
  note_cs: string | null; // radical/component note in Czech
  review_status: ReviewStatus;
};

export type ReviewStatus = 'draft' | 'reviewed';

// The official HSK 1 character list is the characters of the HSK 1 words minus these, which it teaches later.
export const HSK1_LATER_CHARS = ['店', '饺'];

// Splits one CSV line, keeping commas inside "quoted" fields ("" is an escaped quote).
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      fields.push(field);
      field = '';
    } else field += c;
  }
  fields.push(field);
  return fields;
}

export function parseCsv(text: string): Record<string, string>[] {
  const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const keys = parseCsvLine(header);
  return lines.map((line, i) => {
    const fields = parseCsvLine(line);
    if (fields.length !== keys.length) throw new Error(`CSV row ${i + 2}: ${fields.length} fields, expected ${keys.length}`);
    return Object.fromEntries(keys.map((k, j) => [k, fields[j]]));
  });
}

// shortcut: numbers repeated hanzi per level (花, 花 in HSK 2 -> 1, 2), but official homograph
// numbers span levels (会1 in HSK 1, 会2 in HSK 3); use those before importing HSK 2.
export function buildRecords(rows: Record<string, string>[], level: number): WordRecord[] {
  const senses = new Map<string, number>();
  return rows
    .filter((r) => r.hsk3_band === String(level))
    .sort((a, b) => Number(a.hsk3_seq) - Number(b.hsk3_seq))
    .map((r): WordRecord => {
      const sense = (senses.get(r.simplified) ?? 0) + 1;
      senses.set(r.simplified, sense);
      return {
        id: `w:${r.simplified}:${sense}`,
        hanzi: r.simplified,
        pinyin: r.pinyin,
        pos: r.pos_zh || null,
        level,
        seq: Number(r.hsk3_seq),
        syllabus_version: '2025-11',
        gloss_cs: null,
        review_status: 'draft',
      };
    });
}

// shortcut: HSK 1 only; HSK 2 needs its own exceptions and must skip characters already in HSK 1
export function hsk1Characters(words: WordRecord[]): string[] {
  const chars = new Set(words.filter((w) => w.level === 1).flatMap((w) => [...w.hanzi]));
  return [...chars].filter((c) => !HSK1_LATER_CHARS.includes(c));
}

export function buildCharacters(words: WordRecord[]): CharacterRecord[] {
  return hsk1Characters(words).map((hanzi) => ({ id: `c:${hanzi}`, hanzi, level: 1, note_cs: null, review_status: 'draft' }));
}
