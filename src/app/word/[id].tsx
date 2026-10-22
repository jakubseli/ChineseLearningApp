import { eq, inArray } from 'drizzle-orm';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChineseText } from '@/components/chinese-text';
import { DraftBadge } from '@/components/draft-badge';
import { characters, words } from '@/data/content-schema';
import { useContentDb } from '@/data/db';
import { posLabel } from '@/domain/czech';

export default function WordDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useContentDb();
  const word = useMemo(() => db.select().from(words).where(eq(words.id, id)).get(), [db, id]);
  const chars = useMemo(() => (word ? db.select().from(characters).where(inArray(characters.hanzi, [...word.hanzi])).all() : []), [db, word]);

  if (!word) return <Text style={styles.missing}>Slovo nenalezeno</Text>;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Stack.Screen options={{ title: word.hanzi }} />
      <ChineseText style={styles.hanzi}>{word.hanzi}</ChineseText>
      <Pressable onPress={() => Speech.speak(word.hanzi, { language: 'zh-CN' })} accessibilityRole="button" accessibilityLabel="Přečíst nahlas">
        <Text style={styles.pinyinLine}>
          <ChineseText>{word.pinyin}</ChineseText> 🔊
        </Text>
      </Pressable>
      <Text style={[styles.gloss, !word.gloss_cs && styles.missing]}>{word.gloss_cs ?? 'chybí překlad'}</Text>
      <Text style={styles.meta}>{posLabel(word.pos)}</Text>
      <DraftBadge status={word.review_status} />

      <Text style={styles.section}>Znaky</Text>
      <View style={styles.chips}>
        {[...new Set(word.hanzi)].map((h) => {
          const c = chars.find((c) => c.hanzi === h);
          const chip = (
            <Pressable key={h} style={styles.chip} disabled={!c}>
              <ChineseText style={styles.chipHanzi}>{h}</ChineseText>
              {c && <ChineseText style={styles.chipRadical}>{c.radical}</ChineseText>}
            </Pressable>
          );
          return c ? (
            <Link key={h} href={{ pathname: '/character/[id]', params: { id: c.id } }} asChild>
              {chip}
            </Link>
          ) : (
            chip
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  hanzi: {
    fontSize: 72,
  },
  pinyinLine: {
    fontSize: 22,
    color: '#666',
  },
  gloss: {
    fontSize: 22,
    textAlign: 'center',
  },
  missing: {
    color: '#aaa',
  },
  meta: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    alignSelf: 'stretch',
    marginTop: 24,
    fontSize: 14,
    color: '#666',
  },
  chips: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
  },
  chipHanzi: {
    fontSize: 28,
  },
  chipRadical: {
    fontSize: 14,
    color: '#666',
  },
});
