import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { words } from '@/data/content-schema';

import { ChineseText } from './chinese-text';

type Props = Pick<typeof words.$inferSelect, 'id' | 'hanzi' | 'pinyin' | 'gloss_cs'>;

export function WordRow({ id, hanzi, pinyin, gloss_cs }: Props) {
  return (
    <Link href={{ pathname: '/word/[id]', params: { id } }} asChild>
      <Pressable style={styles.row}>
        <ChineseText style={styles.hanzi}>{hanzi}</ChineseText>
        <ChineseText style={styles.pinyin}>{pinyin}</ChineseText>
        <Text style={[styles.gloss, !gloss_cs && styles.missing]} numberOfLines={1}>
          {gloss_cs ?? 'chybí překlad'}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  hanzi: {
    fontSize: 24,
    minWidth: 64,
  },
  pinyin: {
    fontSize: 15,
    color: '#666',
    minWidth: 80,
  },
  gloss: {
    flex: 1,
    fontSize: 15,
  },
  missing: {
    color: '#aaa',
  },
});
