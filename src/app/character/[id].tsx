import { eq, like } from 'drizzle-orm';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChineseText } from '@/components/chinese-text';
import { DraftBadge } from '@/components/draft-badge';
import { WordRow } from '@/components/word-row';
import { characters, words } from '@/data/content-schema';
import { useContentDb } from '@/data/db';

export default function CharacterDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useContentDb();
  const char = useMemo(() => db.select().from(characters).where(eq(characters.id, id)).get(), [db, id]);
  const used = useMemo(
    () => (char ? db.select().from(words).where(like(words.hanzi, `%${char.hanzi}%`)).orderBy(words.seq).all() : []),
    [db, char],
  );

  if (!char) return <Text style={styles.missing}>Znak nenalezen</Text>;

  return (
    <ScrollView>
      <Stack.Screen options={{ title: char.hanzi }} />
      <View style={styles.head}>
        <ChineseText style={styles.hanzi}>{char.hanzi}</ChineseText>
        <Text style={styles.meta}>
          radikál <ChineseText>{char.radical}</ChineseText>
        </Text>
        <Text style={[styles.note, !char.note_cs && styles.missing]}>{char.note_cs ?? 'chybí poznámka'}</Text>
        <DraftBadge status={char.review_status} />
      </View>
      <Text style={styles.section}>Slova s tímto znakem</Text>
      {used.map((w) => (
        <WordRow key={w.id} {...w} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  hanzi: {
    fontSize: 96,
  },
  meta: {
    fontSize: 16,
    color: '#666',
  },
  note: {
    fontSize: 16,
    textAlign: 'center',
  },
  missing: {
    color: '#aaa',
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    fontSize: 14,
    color: '#666',
  },
});
