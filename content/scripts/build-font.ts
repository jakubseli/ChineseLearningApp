import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync } from 'node:fs';

import { readJsonl } from './jsonl.ts';

const full = 'content/raw/noto-sans-sc/NotoSansSC-Regular.otf';
const out = 'assets/fonts/noto_sans_sc.otf';
const covered = 'assets/fonts/noto_sans_sc_chars.txt';
const fonttools = ['--from', 'fonttools==4.67.0'];

const ascii = Array.from({ length: 0x7f - 0x20 }, (_, i) => String.fromCharCode(0x20 + i)).join('');
const text = [
  ...readJsonl('content/source/words.jsonl').map((w) => w.hanzi + w.pinyin),
  ...readJsonl('content/source/characters.jsonl').map((c) => c.hanzi),
  ascii,
  'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüĀÁǍÀĒÉĚÈŌÓǑÒ',
  '。，？！、：“”',
].join('');
const unicodes = [...new Set(text)].map((c) => c.codePointAt(0)!.toString(16)).join(',');

mkdirSync('assets/fonts', { recursive: true });
execFileSync('uvx', [...fonttools, 'pyftsubset', full, `--unicodes=${unicodes}`, '--name-IDs=*', `--output-file=${out}`], { stdio: 'inherit' });

const py = `from fontTools.ttLib import TTFont; open('${covered}', 'w', encoding='utf-8').write(''.join(map(chr, sorted(TTFont('${out}').getBestCmap()))))`;
execFileSync('uvx', [...fonttools, 'python', '-c', py], { stdio: 'inherit' });

console.log(`${out}: ${[...readFileSync(covered, 'utf8')].length} characters, ${Math.round(statSync(out).size / 1024)} KB`);
