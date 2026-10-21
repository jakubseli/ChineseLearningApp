// Czech wording for the UI.

// 1 slovíčko, 2–4 slovíčka, 0 and 5+ slovíček.
export function plural(n: number, [one, few, many]: [string, string, string]): string {
  if (n === 1) return one;
  return n >= 2 && n <= 4 ? few : many;
}

// Every part-of-speech code used in the HSK 3.0 syllabus.
const POS: Record<string, string> = {
  名: 'podstatné jméno',
  动: 'sloveso',
  形: 'přídavné jméno',
  副: 'příslovce',
  代: 'zájmeno',
  数: 'číslovka',
  量: 'počítací slovo',
  数量: 'číslovka s počítacím slovem',
  助: 'částice',
  介: 'předložka',
  连: 'spojka',
  叹: 'citoslovce',
  拟声: 'zvukomalebné slovo',
  前缀: 'předpona',
  后缀: 'přípona',
};

// Official notation like "形、介、（动、量）": main uses first, bracketed ones are less common.
// null is a set phrase (你好, 没关系).
export function posLabel(pos: string | null): string {
  if (pos === null) return 'ustálené spojení';
  const label = (codes: string[]) =>
    codes
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => POS[c] ?? c)
      .join(', ');
  const main = label(pos.replace(/（[^）]*）/g, '').split('、'));
  const also = label([...pos.matchAll(/（([^）]*)）/g)].flatMap((m) => m[1].split('、')));
  return also ? `${main} (také ${also})` : main;
}
