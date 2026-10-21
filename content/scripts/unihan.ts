// Pure parser for the Unicode data in content/raw/unihan/. No file I/O, so it can be unit-tested.

// Returns each character's Unihan radical as a character. Unihan follows the Kangxi system with full
// forms (这 -> 辵, 你 -> 人, 个 -> 丨), so this only prefills the radical; the mainland form is set by hand.
// unihanText: lines like "U+8BF4\tkRSUnicode\t149'.7" (radical number, then strokes outside the radical).
// radicalsText: CJKRadicals.txt lines like "149'; 2EC8; 8BA0", whose last field is the radical as a CJK character.
export function unihanRadicals(unihanText: string, radicalsText: string): Map<string, string> {
  const radicals = new Map(
    radicalsText
      .split(/\r?\n/)
      .filter((l) => /^\d/.test(l))
      .map((l) => {
        const [num, , ideograph] = l.split(';').map((f) => f.trim());
        return [num, String.fromCodePoint(parseInt(ideograph, 16))];
      }),
  );

  const result = new Map<string, string>();
  for (const line of unihanText.split(/\r?\n/)) {
    const [code, field, value] = line.split('\t');
    if (field !== 'kRSUnicode') continue;
    // A few characters list several radicals; the first is the primary one.
    const radical = radicals.get(value.split(' ')[0].split('.')[0]);
    if (radical) result.set(String.fromCodePoint(parseInt(code.slice(2), 16)), radical);
  }
  return result;
}
