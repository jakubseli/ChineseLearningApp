const BASE = new Map(
  ['aāáǎà', 'eēéěè', 'iīíǐì', 'oōóǒò', 'uūúǔùǖǘǚǜüů', 'cč', 'dď', 'nňń', 'rř', 'sš', 'tť', 'yý', 'zž'].flatMap(([base, ...marked]) =>
    marked.map((m) => [m, base] as const),
  ),
);

export const searchKey = (s: string) =>
  [...s.toLowerCase()]
    .map((c) => BASE.get(c) ?? c)
    .join('')
    .replace(/v/g, 'u')
    .replace(/[\s'’-]/g, '');

export function wordMatches(word: { hanzi: string; pinyin: string; gloss_cs: string | null }, query: string): boolean {
  const q = searchKey(query);
  return [word.hanzi, word.pinyin, word.gloss_cs ?? ''].some((field) => searchKey(field).includes(q));
}
